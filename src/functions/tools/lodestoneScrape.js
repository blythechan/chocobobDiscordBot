
const puppeteer = require('puppeteer');
scrapeLodestoneByCharacterId = async function (id) {
    const browser = await puppeteer.launch({ headless: "new"});
    const page = await browser.newPage();
    await page.goto(`https://na.finalfantasyxiv.com/lodestone/character/${id}/`);
    let pieces = await page.evaluate(() => {
        const fcDataFromLS =
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
            fcDataFromLS.name.push(element.textContent);
        }

        /**
         * Retrieves the achievement title
         */
        for(let element of characterTitle) {
            fcDataFromLS.title.push(element.textContent);
        }

        /**
         * Retrieves the server and data center
         */
        for(let element of characterWorld) {
            fcDataFromLS.world.push(element.textContent);
        }

        /**
         * Retrieves race, nameday, registered city state, GC, and FC
         */
        for(let element of characterProfile) {
            const ele = element.textContent;
            if(ele.toLowerCase().includes("race/clan/gender"))
                fcDataFromLS.profile.push(ele.replace("Race/Clan/Gender", "").replace(/([A-Z])/g, ' $1'));
            else if(ele.toLowerCase().includes("grand company"))
                fcDataFromLS.profile.push(ele.replace("Grand Company", ""));
            else if(ele.toLowerCase().includes("free company"))
                fcDataFromLS.profile.push(ele.replace("Free Company", ""));
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
            fcDataFromLS.activeClass.push(firstUrl);
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
                    fcDataFromLS.classes.push({ url, jobClass, level });
                }
            }
        }

        for(let element of characterBio) {
            fcDataFromLS.bio.push(element.innerHTML);
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
                    fcDataFromLS.attributes.push({ [match[1].toString()]: parseInt(match[2]) || 0 });
                }
            } else if(ele.includes("HP")) {
                let match;
                while ((match = wordNumberRegex.exec(ele)) !== null) {
                    fcDataFromLS.statusAttributes.push({ [match[1].toString()]: parseInt(match[2]) || 0 });
                }
            }
        }
        
        for(let element of characterDetailImage) {
            const htmlString = element.innerHTML;
            const tempElement = document.createElement('div');
            tempElement.innerHTML = htmlString;
            const firstAnchorTag = tempElement.querySelector('a');
            const firstURL = firstAnchorTag ? firstAnchorTag.getAttribute('href').split('?')[0] : "https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg";
            fcDataFromLS.portrait.push(firstURL);
        }
        
        return fcDataFromLS;
    });

    await browser.close();
    return pieces;
}

scrapeLodestoneByFreeCompanyId = async function (id) {
    const browser = await puppeteer.launch({ headless: "new"});
    const page = await browser.newPage();
    await page.goto(`https://na.finalfantasyxiv.com/lodestone/freecompany/${id}/`);
    let pieces = await page.evaluate(() => {
        const fcDataFromLS =
            {
                "crest": [],
                "gc": [],
                "name": [],
                "slogan": [],
                "tag": [],
                "formed": [],
                "world_rank": [],
                "address": [],
                "active": [],
                "recruitment": [],
                "focus": []
            }
        ;

        let fcCrest = document.getElementsByClassName("entry__freecompany__crest__image");
        let fcGC = document.getElementsByClassName("entry__freecompany__gc");
        let fcName = document.getElementsByClassName("entry__freecompany__name");
        let fcSlogan = document.getElementsByClassName("freecompany__text freecompany__text__message");
        let fcTag = document.getElementsByClassName("freecompany__text freecompany__text__tag");
        let fcDetail = document.getElementsByClassName("freecompany__text");
        let fcWorldRanking = document.getElementsByClassName("character__ranking__data parts__space--reset");
        let fcAddress = document.getElementsByClassName("freecompany__estate__text");
        let fcRecruitment = document.getElementsByClassName("freecompany__text freecompany__recruitment");
        let fcFocus = document.getElementsByClassName("freecompany__focus_icon clearfix");

        /**
         * Retrieves crest
         */
        for(let element of fcCrest) {
            const urls = element.innerHTML.match(/src="([^"]+)"/g).map(match => match.slice(5, -1));
            fcDataFromLS.crest= urls;
        }

        /**
         * Retrieves grand company and world
         */
        for(let element of fcGC) {
            const cleanedGC = element.textContent.replace(/\n|\t/g, "");
            fcDataFromLS.gc.push(cleanedGC);
        }

        /**
         * Retrieves name
         */
        for(let element of fcName) {
            fcDataFromLS.name.push(element.textContent);
        }

        /**
        * Retrieves slogan
        */
        for(let element of fcSlogan) {
            fcDataFromLS.slogan.push(element.textContent);
        }

        /**
        * Retrieves tag
        */
        for(let element of fcTag) {
            fcDataFromLS.tag.push(element.textContent);
        }

        /**
        * Retrieves lots of details
        */
        for(let element of fcDetail) {
            const foundedRegex = /<span[^>]*>(.*?)<\/span>/; // Regular expression to match text between <span> and </span> tags
            const match = element.innerHTML.match(foundedRegex);

            if (match && match.length > 1) {
                fcDataFromLS.formed.push(match[1]);
            }
        }

        /**
        * Retrieves ranking in world
        */
        for(let element of fcWorldRanking) {
            const regex = /<th>(.*?)<\/th>/g; // Regular expression to match text between <th> and </th> tags
            const matches = element.innerHTML.match(regex);
            if (matches) {
                const textArray = matches.map(match => match.replace(/<[^>]*>/g, '')); // Remove HTML tags
                fcDataFromLS.world_rank.push(textArray);
            }
        }

        /**
        * Retrieves address
        */
        for(let element of fcAddress) {
            fcDataFromLS.address.push(element.innerHTML);
        }
        /**
        * Retrieves recruitment status
        */
        for(let element of fcRecruitment) {
            const replacedString = element.innerHTML.replace(/\n|\t/g, '');
            fcDataFromLS.recruitment.push(replacedString);
        }
        /**
        * Retrieves recruitment status
        */
        for(let element of fcFocus) {
            const regex = /<li>(?:(?!icon--of).)*?<p>(.*?)<\/p>/gs;
            const matches = Array.from(element.innerHTML.matchAll(regex), m => m[1]);

            fcDataFromLS.focus.push(matches);
        }

        return fcDataFromLS;
    });

    await page.goto(`https://na.finalfantasyxiv.com/lodestone/freecompany/${id}/member/`);
    let memberPieces = await page.evaluate(() => {
        const fcMemberDataFromLS =
            {
                "memberCount": [],
                "founder": [],
                "founderChara": []
            }
        ;

        let memberCount = document.getElementsByClassName("parts__total");
        let founder = document.getElementsByClassName("entry__name");
        let founderChara = document.getElementsByClassName("entry__chara__face");
     
        for(let element of memberCount) {
            fcMemberDataFromLS.memberCount.push(element.textContent.replace("Total", ""));
        }

        for(let element of founder) {
            // Only retrieve the FC leader
            if(fcMemberDataFromLS.founder.length === 0) {
                fcMemberDataFromLS.founder.push(element.innerHTML);
            }
        }

        for(let element of founderChara) {
            // Only retrieve the FC leader
            if(fcMemberDataFromLS.founderChara.length === 0) {
                const regex = /<img\s+src="([^"]+)"/;
                const match = element.innerHTML.match(regex);

                if (match && match.length > 1) {
                    fcMemberDataFromLS.founderChara.push(match[1]);
                }  
            }
        }

        return fcMemberDataFromLS;
    });
    await browser.close();

    return { fc: pieces, members: memberPieces };
}

scrapeLodestoneBioBycharacterId = async function (id) {
    const browser = await puppeteer.launch({ headless: "new"});
    const page = await browser.newPage();
    await page.goto(`https://na.finalfantasyxiv.com/lodestone/character/${id}/`);
    let pieces = await page.evaluate(() => {
        const characterDataFromLS = {
            "bio": [],
            "name": [],
            "world": []
        };

        let characterBio = document.getElementsByClassName("character__selfintroduction");
        let characterName = document.getElementsByClassName("frame__chara__name");
        let characterWorld = document.getElementsByClassName("frame__chara__world");

        /**
         * Retrieves bio
         */
        for(let element of characterBio) {
            characterDataFromLS.bio.push(element.textContent);
        }

        /**
         * Retrieves first and last name
         */
        for(let element of characterName) {
            characterDataFromLS.name.push(element.textContent);
        }
        
        /**
         * Retrieves the server and data center
         */
        for(let element of characterWorld) {
            characterDataFromLS.world.push(element.textContent);
        }

        return characterDataFromLS;
    });

    await browser.close();

    return pieces;
}



module.exports = scrapeLodestoneByCharacterId;
module.exports = scrapeLodestoneByFreeCompanyId;
module.exports = scrapeLodestoneBioBycharacterId;