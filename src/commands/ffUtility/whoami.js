const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require("cheerio");
const Character = require('../../schemas/character');
const CommandAudit = require('../../statics/commandAuditUtility');
const defaults = require('../../functions/tools/defaults.json');
const Canvas = require('@napi-rs/canvas');
const requestOptions_limit = {
    method: 'GET',
    timeout: 0,
};

const applyText = (canvas, text) => {
    const context = canvas.getContext('2d');
    let fontSize = 60;

    do {
        context.font = `${fontSize -= 10}px MingLiU-ExtB`;
    } while (context.measureText(text).width > canvas.width - 200);

    return context.font;
};

const applySubText = (canvas, text) => {
    const context = canvas.getContext('2d');
    let fontSize = 40;

    do {
        context.font = `${fontSize -= 10}px Arial`;
    } while (context.measureText(text).width > canvas.width - 200);

    return context.font;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whoami')
        .setDescription(`Retrieves a character's data from the Lodestone.`)
        .addStringOption(option => option.setName('characterid').setDescription('Mention a Lodestone character Id').setRequired(false))
        .addUserOption(option => option.setName('user').setDescription('Mention the Discord user you want to retrieve').setRequired(false)),
    async execute(interaction) {
        try {

            await interaction.deferReply();

            const guildId = interaction.guild.id;
            const author = interaction.guild.members.cache.get(interaction.member.id);
			const user = interaction.options.getUser("user") || interaction.guild.members.cache.get(interaction.member.id);
            // Verify command is past cooldown
            const verifyCooldown = await CommandAudit.checkCooldown(guildId, author, "whoami", "5 minutes");
            if(!verifyCooldown) {
                const messagecontent = defaults.DEFAULT_RESPONSES[1].replace("COOLDOWN_LIMIT", "5");
                const CARD_EMBED_ERROR1 = new EmbedBuilder()
                    .setColor(defaults.COLOR)
                    .setDescription(messagecontent)
                    .setThumbnail(defaults.CHOCO_SAD_ICON);
                await interaction.editReply({ embeds: [CARD_EMBED_ERROR1] });
                return;
            }

            const character = interaction.options.getString('characterid');

            let lodestoneCharacter = undefined;

            if(character) {
                lodestoneCharacter = (/^\d+$/.test(character))
                    ? await Character.findOne({ guildId: interaction.guild._id, memberId: author, characterId: character })
                    : await Character.findOne({ guildId: interaction.guild._id, memberId: author, characterName: character });
            } else if(user) {
                lodestoneCharacter = await Character.find({ guildId: interaction.guild._id, memberId: user.id });
                console.log("Character retrieval:", lodestoneCharacter);
            } else {
                const CARD_EMBED_ERROR2 = new EmbedBuilder()
                    .setColor(defaults.COLOR)
                    .setDescription(`Kweh! I could not retrieve that character because it is either not registered with me or the information you provided is incorrect. Try searching them up by their character Id.`)
                    .addFields(
                        { name: 'To Register', value: "`/verify server user` and follow the instructions in the DM that I send you." },
                    )
                    .setThumbnail(defaults.CHOCO_SAD_ICON);
                await interaction.editReply({ embeds: [CARD_EMBED_ERROR2] });
                return;
            }

            let useFFXIVCollect = true;         // Determines if FFXIVCollect API scanned character's data, is set if finalCollect returns 404
            let finalCollect    = undefined;    // Stored data from FFXIVCollect API

            let characterAC     = undefined;    // Stores Achievements, if public
            let characterMI     = undefined;    // Stores minions, public by default
            let characterMO     = undefined;    // Stores mounts, public by default

            let collectionsMissing = "";

            /** CHEERIO VARS */
            const cheerioResults = {
                name: [],
                playerTitle: [],
                world: [],
                race: [],
                fc: [],
                portrait: [],
                activeClass: [],
                activeClassIcon: [],
                jobClasses: [],
                attributes: [],
            }
            /** CHEERIO VARS */

            const CHARACTER_ID = lodestoneCharacter 
                ? lodestoneCharacter.characterId
                : /^\d+$/.test(character)
                    ? character
                    : false;
            if(CHARACTER_ID) {
                await axios
                    .get(`https://na.finalfantasyxiv.com/lodestone/character/${CHARACTER_ID}/`)
                    .then(function (response) {
                        const $ = cheerio.load(response.data);
                        $('#character > div.frame__chara.js__toggle_wrapper > a > div.frame__chara__box > p.frame__chara__name').each((idx, element) => {
                            const fullName = $(element).text();
                            cheerioResults.name.push(fullName);
                        });

                        $('#character > div.frame__chara.js__toggle_wrapper > a > div.frame__chara__box > p.frame__chara__title').each((idx, element) => {
                            const title = $(element).text();
                            cheerioResults.playerTitle.push(title);
                        });

                        $('#character > div.frame__chara.js__toggle_wrapper > a > div.frame__chara__box > p.frame__chara__world').each((idx, element) => {
                            const world = $(element).text();
                            cheerioResults.world.push(world);
                        });

                        $('#character > div.character__content.selected > div.character__profile.clearfix > div.character__profile__data > div:nth-child(1) > div > div:nth-child(1) > div > p.character-block__name').each((idx, element) => {
                            const race = $(element).text();
                            cheerioResults.race.push(race);
                        });
                        
                        $('#character > div.character__content.selected > div.character__profile.clearfix > div.character__profile__data > div:nth-child(1) > div > div:nth-child(5) > div.character-block__box > div > h4 > a').each((idx, element) => {
                            const fc = $(element).text();
                            cheerioResults.fc.push(fc);
                        });

                        $('#character > div.character__content.selected > div.character__profile.clearfix > div.character__profile__detail > div.character__view.clearfix > div.character__detail > div.character__detail__image > a > img:nth-child(1)').each((idx, element) => {
                            const src = $(element).attr('src');
                            cheerioResults.portrait.push(src);
                        });
                        
                        $('#character > div.character__content.selected > div.character__profile.clearfix > div.character__profile__detail > div.character__view.clearfix > div.character__class > div.character__class__data > p').each((idx, element) => {
                            const activeClass = $(element).text();
                            cheerioResults.activeClass.push(activeClass);
                        });
                        
                        $('#character > div.character__content.selected > div.character__profile.clearfix > div.character__profile__detail > div.character__view.clearfix > div.character__class > div.character__class__data > div > img').each((idx, element) => {
                            const src = $(element).attr('src');
                            cheerioResults.activeClassIcon.push(src);
                        });
                        
                        $('div.character__level__list ul li').each((index, element) => {
                            const level = $(element).text();
                            const jobClassIcon = $(element).find('img').attr('src');
                            
                            cheerioResults.jobClasses.push({ level, jobClassIcon });
                        });

                        $('table.character__param__list tbody tr').each((index, element) => {
                            // Get the text from the <th> and <td> elements
                            const key = $(element).find('th').text().replace("Potency", "").trim();
                            const value = $(element).find('td').text().trim();
                            
                            // Push key-value pair to the result array
                            cheerioResults.attributes.push({ key, value });
                        });
                    })
                    .catch(error => {
                        console.error(`Error encountered during verify:`, error);
                    });
                finalCollect = await fetch(`https://ffxivcollect.com/api/characters/${CHARACTER_ID}`, requestOptions_limit)
                    .then(response => response.json());
            } else {
                const CARD_EMBED_ERROR3 = new EmbedBuilder()
                    .setColor(defaults.COLOR)
                    .setDescription(`Kweh! I could not retrieve ${character || user.username} because it is either not registered with me or the information you provided is incorrect. Try searching them up by their character Id.`)
                    .addFields(
                        { name: 'To Register', value: "`/verify server user` and follow the instructions in the DM that I send you." },
                    )
                    .setThumbnail(defaults.CHOCO_SAD_ICON);
                await interaction.editReply({ embeds: [CARD_EMBED_ERROR3] });
                return;
            }

            // Check if ffxivCollect was able to obtain character data, if failure then switch to lodestone API
            useFFXIVCollect = finalCollect.error === "Not found" ? false : true;
            // Store the character's data into one object
            characterAC = useFFXIVCollect ? finalCollect.achievements.count : 0;
            characterMI = useFFXIVCollect ? finalCollect.minions.count : 0;
            characterMO = useFFXIVCollect ? finalCollect.mounts.count : 0;


            // Get totals
            const totalAC = await fetch(`https://xivapi.com/Achievement?limit=1`)
                .then(response => response.json());
            const totalMO = await fetch(`https://xivapi.com/Mount?limit=1`)
                .then(response => response.json());
            const totalMI = await fetch(`https://xivapi.com/Companion?limit=1`)
                .then(response => response.json());

            const canvas = Canvas.createCanvas(2000, 873);
            const context = canvas.getContext('2d');

            // Backdrop
            context.rect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgba(45, 46, 48, 0.8)";
            context.fill();

            // Character Portrait
            const portrait = await Canvas.loadImage(cheerioResults.portrait[0]);
            context.drawImage(portrait, 0, 0, 640, 873);

            if(useFFXIVCollect) {
                // Collections backdrop
                context.beginPath();
                context.fillStyle = "rgba(45, 46, 48, 0.8)";
                context.fillRect(20, 550, 620, 300);
                context.stroke();
                context.closePath();
            }
                // Character text details backdrop
                context.beginPath();
                context.fillStyle = "#131138";
                context.fillRect(640, 0, 1700, 220);
                context.stroke();
                context.closePath();
           

            // STATS
            if(useFFXIVCollect) {
                context.font = applyText(canvas, "Collections");
                context.fillStyle = 'WHITE';
                context.fillText("Collections", 50, 600);
                const charAC = `Achievements: ${characterAC} / ${totalAC.Pagination.ResultsTotal}`;
                context.font = applySubText(canvas, charAC);
                context.fillStyle = 'WHITE';
                context.fillText(charAC, 50, 640);

                const charJobs = `Class Jobs: ${Object.keys(cheerioResults.jobClasses).length || "ERROR"} / 31`;
                context.font = applySubText(canvas, charJobs);
                context.fillStyle = 'WHITE';
                context.fillText(charJobs, 50, 680);

                const charMI = `Minions: ${characterMI} / ${totalMI.Pagination.ResultsTotal}`;
                context.font = applySubText(canvas, charMI);
                context.fillStyle = 'WHITE';
                context.fillText(charMI, 50, 720);

                const charMO = `Mounts: ${characterMO} / ${totalMO.Pagination.ResultsTotal}`;
                context.font = applySubText(canvas, charMO);
                context.fillStyle = 'WHITE';
                context.fillText(charMO, 50, 760);
            } else {
                collectionsMissing = `\n Error: Collections cannot be retrieved because ${cheerioResults.name} has not registered with FFXIV Collect.`;
            }

            // NAME
            const title = cheerioResults.playerTitle;
            const charName = `${cheerioResults.name} <${title}>`;
            context.font = applySubText(canvas, charName);
            context.fillStyle = 'WHITE';
            context.fillText(charName, 700, 60);

            // ACTIVE CLASS/JOB ICON (draws it over portrait)
            const classJobIcon = await Canvas.loadImage(cheerioResults.activeClassIcon[0]);
            context.drawImage(classJobIcon, 0, 0, 55, 55);

            // RACE
            const charRace = `Species: ${cheerioResults.race[0]} `;
            context.font = applySubText(canvas, charRace);
            context.fillStyle = 'WHITE';
            context.fillText(charRace, 700, 100);

            // SERVER
            const charServer = `World: ${cheerioResults.world}`;
            context.font = applySubText(canvas, charServer);
            context.fillStyle = 'WHITE';
            context.fillText(charServer, 700, 140);

            // FC
            const charFC = `Free Company: ${cheerioResults.fc[0]}`;
            context.font = applySubText(canvas, charFC);
            context.fillStyle = 'WHITE';
            context.fillText(charFC, 700, 180);

            // statusAttributes, attributes
            // ATTRIBUTES
            if(cheerioResults.attributes) {
                context.font = applyText(canvas, "Attributes");
                context.fillStyle = 'WHITE';
                context.fillText("Attributes", 1290, 280);

                let attrX = 1300;
                let attrY = 280;
                let attribute = 1;
                (cheerioResults.attributes || []).map(obj => {
                    const key = obj.key//Object.keys(obj)[0];
                    const value = obj.value;
                    attrX = attrX + 400;
                    if (attribute % 2 === 1) {
                        attrY = attrY + 50;
                        attrX = 1300;
                    }

                    const attNum = value;
                    const name = key;
                    const charAtt = `${name}: ${attNum}`;
                    context.font = applySubText(canvas, charAtt);
                    context.fillStyle = 'WHITE';
                    context.fillText(charAtt, attrX, attrY);

                    attribute++;
                })
            }

            // CLASSES
            context.font = applyText(canvas, "Classes");
            context.fillStyle = 'WHITE';
            context.fillText("Classes", 750, 270);

            const charClasses = cheerioResults.jobClasses;
            let y = 200;
            let x = 700;
            let placeholder = 1;
            //const iconImageRepo = `https://raw.githubusercontent.com/xivapi/classjob-icons/master/icons`;
            for (var i = 0; i <= charClasses.length - 1; i++) {
                const classJob = charClasses[i];
                if (classJob) {

                    x = x + 100;
                    if (placeholder % 5 === 1) {
                        y = y + 85;
                        x = 700;
                    }

                    const imageURL = classJob.jobClassIcon;
                    const classJobIcon = await Canvas.loadImage(imageURL);
                    context.drawImage(classJobIcon, x + 50, y, 55, 55);

                    const classJobLevel = classJob.level;

                    context.font = applySubText(canvas, classJobLevel);
                    context.fillStyle = "WHITE";
                    context.fillText(classJobLevel, x + 57, y + 75);


                    placeholder++;
                }
            }

            const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'selfportrait.png' });
            const dataUsage = "\n Powered by FFXIV Collect and Lodestone";
            CommandAudit.createAudit(guildId, author, "whoami");
            
            await interaction.editReply({ content: ` :mag: Click the card to maximize. ${dataUsage}${collectionsMissing}`, files: [attachment] });
        } catch (ex) {
            console.error("Error during character data retrieval:", ex);
            const CARD_EMBED_ERROR3 = new EmbedBuilder()
                .setColor(defaults.COLOR)
                .setDescription(`There was an error while retrieving that character's data!`)
                .setThumbnail(defaults.CHOCO_SAD_ICON);
            await interaction.editReply({ embeds: [CARD_EMBED_ERROR3] });
        }
    },
};

