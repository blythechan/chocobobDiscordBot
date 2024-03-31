
const puppeteer = require('puppeteer');

scrapeLodestoneByFreeCompanyId = async function (id) {
    const browser = await puppeteer.launch({ headless: true, ignoreDefaultArgs: ['--disable-extensions'] });
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

module.exports = scrapeLodestoneByFreeCompanyId;