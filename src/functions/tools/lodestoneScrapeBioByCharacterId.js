
const puppeteer = require('puppeteer');

scrapeLodestoneBioBycharacterId = async function (id) {
    const browser = await puppeteer.launch({ headless: true, ignoreDefaultArgs: ['--disable-extensions'] });
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

module.exports = scrapeLodestoneBioBycharacterId;