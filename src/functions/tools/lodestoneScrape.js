
const puppeteer = require('puppeteer');
scrapeLodestoneByCharacterId = async function (id) {
    const browser = await puppeteer.launch({ headless: "new"});
    const page = await browser.newPage();
    await page.goto(`https://na.finalfantasyxiv.com/lodestone/character/${id}/`);
    let pieces = await page.evaluate(() => {
        const characterDataFromLS =
            {
                "name": [],
                "title": [],
                "world": [],
                "profile": [],
                "activeClass": [],
                "classes": [],
                "statusAttributes": [],
                "attributes": [],
                "bio": [],
                "portrait": []
            }
        ;

        let characterJobs = document.getElementsByClassName("character__level__list");
        let characterBio = document.getElementsByClassName("character__selfintroduction");
        let characterName = document.getElementsByClassName("frame__chara__name");
        let characterProfile = document.getElementsByClassName("character-block__box");
        let characterTitle = document.getElementsByClassName("frame__chara__title");
        let characterWorld = document.getElementsByClassName("frame__chara__world");
        let characterActiveClass = document.getElementsByClassName("character__class_icon");
        let characterAttributes = document.getElementsByClassName("js__character_toggle");
        let characterDetailImage = document.getElementsByClassName("character__detail__image");

        /**
         * Retrieves first and last name
         */
        for(let element of characterName) {
            characterDataFromLS.name.push(element.textContent);
        }

        /**
         * Retrieves the achievement title
         */
        for(let element of characterTitle) {
            characterDataFromLS.title.push(element.textContent);
        }

        /**
         * Retrieves the server and data center
         */
        for(let element of characterWorld) {
            characterDataFromLS.world.push(element.textContent);
        }

        /**
         * Retrieves race, nameday, registered city state, GC, and FC
         */
        for(let element of characterProfile) {
            const ele = element.textContent;
            if(ele.toLowerCase().includes("race/clan/gender"))
                characterDataFromLS.profile.push(ele.replace("Race/Clan/Gender", "").replace(/([A-Z])/g, ' $1'));
            else if(ele.toLowerCase().includes("grand company"))
                characterDataFromLS.profile.push(ele.replace("Grand Company", ""));
            else if(ele.toLowerCase().includes("free company"))
                characterDataFromLS.profile.push(ele.replace("Free Company", ""));
        }

        /**
         * Retrieves last logged in job class icon, job class name, and level... name and icon are images. Level is in all caps.
         */
        for(let element of characterActiveClass) {
            const htmlString = element.innerHTML;
            // Regular expression to match URLs
            const urlRegex = /https?:\/\/[^\s]+/;
            const matches = htmlString.match(urlRegex);
            const firstUrl = matches ? matches[0].replace('"','') : "https://lds-img.finalfantasyxiv.com/h/E/d0Tx-vhnsMYfYpGe9MvslemEfg.png";
            characterDataFromLS.activeClass.push(firstUrl);
        }

        for(let element of characterJobs) {
            const ele = element.innerHTML.split(/<\/?li>/);
            const data = ele.filter(item => item.trim() !== '');

            for (const item of data) {
                const match = item.match(/src="(.*?)".*data-tooltip="(.*?)">(\d+)/);
                if (match) {
                    const url = match[1];
                    const jobClass = match[2];
                    const level = match[3];
                    characterDataFromLS.classes.push({ url, jobClass, level });
                }
            }
        }

        for(let element of characterBio) {
            characterDataFromLS.bio.push(element.innerHTML);
        }

        /**
         * Retrieves stats
         */
        const attributeTags = ["Attributes", "Offensive Properties", "Defensive Properties", "Physical Properties", "Mental Properties"];
        // Regular expression to match word-number pairs
        const wordNumberRegex = /([A-Za-z\s]+)(\d+)/g;
        const tagRegex = new RegExp(attributeTags.join("|"), "g");
        for(let element of characterAttributes) {
            const ele = element.textContent.replace(tagRegex, "");
            //Straight stats
            if(ele.includes("Strength")) {
                let match;
                while ((match = wordNumberRegex.exec(ele)) !== null) {
                    characterDataFromLS.attributes.push({ [match[1].toString()]: parseInt(match[2]) || 0 });
                }
            } else if(ele.includes("HP")) {
                let match;
                while ((match = wordNumberRegex.exec(ele)) !== null) {
                    characterDataFromLS.statusAttributes.push({ [match[1].toString()]: parseInt(match[2]) || 0 });
                }
            }
        }
        
        for(let element of characterDetailImage) {
            const htmlString = element.innerHTML;
            const tempElement = document.createElement('div');
            tempElement.innerHTML = htmlString;
            const firstAnchorTag = tempElement.querySelector('a');
            const firstURL = firstAnchorTag ? firstAnchorTag.getAttribute('href').split('?')[0] : "https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg";
            characterDataFromLS.portrait.push(firstURL);
        }
        
        return characterDataFromLS;
    });

    await browser.close();
    return pieces;
}


module.exports = scrapeLodestoneByCharacterId;