const { AttachmentBuilder, SlashCommandBuilder, hideLinkEmbed  } = require("discord.js");
const { customEmbedBuilder } = require('../../events/utility/handleEmbed');
const axios = require('axios');
const cheerio = require("cheerio");
const CommandAudit = require('../../statics/commandAuditUtility');
const Guilds = require ('../../statics/guildUtility');
const defaults = require('../../functions/tools/defaults.json');
const Canvas = require('@napi-rs/canvas');

const applyText = (canvas, text) => {
    const context = canvas.getContext('2d');
    let fontSize = 60;

    do {
        context.font = `${fontSize -= 10}px Calibri`;
    } while (context.measureText(text).width > canvas.width - 200);

    return context.font;
};

const applySubText = (canvas, text) => {
    const context = canvas.getContext('2d');
    let fontSize = 80;

    do {
        context.font = `${fontSize}px Constantia`;
    } while (context.measureText(text).width > canvas.width - 200);

    return context.font;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fcstats')
		.setDescription('Retrieve FC statistics')
            .addStringOption(option => option.setName('freecompanyid').setDescription('The Free Company Id to request a stat card for')),
	async execute(interaction) {
        try {
            await interaction.deferReply();

            const guildId =                 interaction.guild.id;
            const guildProfile = 			await Guilds.findByGuild(interaction.guild.id);
            const author =                  interaction.guild.members.cache.get(interaction.member.id);
            const fc =                      interaction.options.getString('freecompanyid') || guildProfile.fcIds[0];

            if((!fc || fc.trim() === "") && (!guildProfile.fcIds || guildProfile.fcIds.length === 0)) {
                const EMBED = customEmbedBuilder(
                    "Free Company Lodestone Id was not recognized."
                );
                return interaction.editReply({
                    embeds: [EMBED],
                    ephemeral: true
                });
            }
            
            // Verify command is past cooldown
            const verifyCooldown = await CommandAudit.checkCooldown(guildId, author, "fcstats", "5 minutes");
            if(!verifyCooldown) {
                const messagecontent = defaults.DEFAULT_RESPONSES[1].replace("COOLDOWN_LIMIT", "5");
                const CARD_EMBED_ERROR1 = new EmbedBuilder()
                    .setColor(defaults.COLOR)
                    .setDescription(messagecontent)
                    .setThumbnail(defaults.CHOCO_SAD_ICON);
                await interaction.editReply({ embeds: [CARD_EMBED_ERROR1] });
                return;
            }

            /** CHEERIO VARS */
            const cheerioResults = {
                crest: [],
                name: [],
                tag: [],
                slogan: [],
                formed: [],
                recruitment: [],
                founderPortrait: [],
                founder: [],
                members: [],
                worldRank: [],
                world: [],
                address: [],
                focus: [],
                seeking: [],
            }
            /** CHEERIO VARS */

            await axios
                .get(`https://na.finalfantasyxiv.com/lodestone/freecompany/${fc}/`)
                .then(function (response) {
                    const $ = cheerio.load(response.data);
                    $('div.entry__freecompany__crest__image img').each((idx, element) => {
                        const crest = $(element).attr('src');
                        cheerioResults.crest.push(crest);
                    });

                    $('#community > div.ldst__bg > div.ldst__contents.clearfix > div.ldst__main > div:nth-child(1) > div.entry > a > div.entry__freecompany__box > p.entry__freecompany__name').each((idx, element) => {
                        const name = $(element).text();
                        cheerioResults.name.push(name);
                    });

                    $('#community > div.ldst__bg > div.ldst__contents.clearfix > div.ldst__main > div:nth-child(1) > div.entry > a > div.entry__freecompany__box > p:nth-child(3)').each((idx, element) => {
                        const world = $(element).text().replace(/^[\s\n\t]+(.+?)\s*\[.*?\].*?$/, '$1').trim();
                        cheerioResults.world.push(world);
                    });

                    $('#community > div.ldst__bg > div.ldst__contents.clearfix > div.ldst__main > div:nth-child(1) > p.freecompany__text.freecompany__text__message').each((idx, element) => {
                        const slogan = $(element).text();
                        cheerioResults.slogan.push(slogan);
                    });
                    
                    $('#community > div.ldst__bg > div.ldst__contents.clearfix > div.ldst__main > div:nth-child(1) > p.freecompany__text.freecompany__text__tag').each((idx, element) => {
                        const tag = $(element).text();
                        cheerioResults.tag.push(tag);
                    });

                    
                    $('#datetime-ef21a6b7bd7').each((idx, element) => {
                        const formed = $(element).text().trim();
                        cheerioResults.formed.push(formed);
                    });

                    $('#community > div.ldst__bg > div.ldst__contents.clearfix > div.ldst__main > div:nth-child(1) > p:nth-child(12)').each((idx, element) => {
                        const members = $(element).text();
                        cheerioResults.members.push(members);
                    });

                    $('#community > div.ldst__bg > div.ldst__contents.clearfix > div.ldst__main > div:nth-child(2) > p.freecompany__text.freecompany__recruitment').each((idx, element) => {
                        const recruitment = $(element).text().replace(/^[\s\n\t]+(.+?)\s*$/, '$1').trim();
                        cheerioResults.recruitment.push(recruitment);
                    });

                    $('#community > div.ldst__bg > div.ldst__contents.clearfix > div.ldst__main > div:nth-child(1) > table tbody tr').each((index, element) => {
                        const key = $(element).find('th').text()
                        cheerioResults.worldRank.push(key);
                    });

                    $('#community > div.ldst__bg > div.ldst__contents.clearfix > div.ldst__main > div:nth-child(1) > p.freecompany__estate__text').each((index, element) => {
                        const address = $(element).text();
                        cheerioResults.address.push(address);
                    })

                    $('#community > div.ldst__bg > div.ldst__contents.clearfix > div.ldst__main > div:nth-child(2) > ul:nth-child(7) li:not([class*="--off"])').each((index, element) => {
                        // Get the image source and text
                        const src = $(element).find('img').attr('src');
                        const text = $(element).find('p').text().trim();

                        // Push data to the result array
                        cheerioResults.focus.push(text);
                    });

                    
                    $('#community > div.ldst__bg > div.ldst__contents.clearfix > div.ldst__main > div:nth-child(2) > ul.freecompany__focus_icon.freecompany__focus_icon--role.clearfix li:not([class*="--off"])').each((index, element) => {
                        // Get the image source and text
                        const src = $(element).find('img').attr('src');
                        const text = $(element).find('p').text().trim();

                        // Push data to the result array
                        cheerioResults.seeking.push(text);
                    });
                })
				.catch(error => {
					console.error(`Error encountered during verify:`, error);
				});

            await axios
                .get(`https://na.finalfantasyxiv.com/lodestone/freecompany/${fc}/member/`)
                .then(function (response) {
                    const $ = cheerio.load(response.data);
                    $('#community > div.ldst__bg > div.ldst__contents.clearfix > div.ldst__main > div > ul:nth-child(5) > li:nth-child(1) > a > div > div.entry__chara__face img').each((idx, element) => {
                        const leader = $(element).attr('src');
                        cheerioResults.founderPortrait.push(leader);
                    });

                    $('#community > div.ldst__bg > div.ldst__contents.clearfix > div.ldst__main > div > ul:nth-child(5) > li:nth-child(1) > a > div > div.entry__freecompany__center > p.entry__name').each((index, element) => {
                        const founder = $(element).text();
                        cheerioResults.founder.push(founder);
                    });
                })
				.catch(error => {
					console.error(`Error encountered during verify:`, error);
				});

            if(cheerioResults.crest.length === 0) {
                await interaction.editReply({ content: "Error", ephemeral: true });
            }

            const canvas = Canvas.createCanvas(2000, 873);
            const context = canvas.getContext('2d');

            // Backdrop
            context.rect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgba(45, 46, 48, 0.8)";
            context.fill();

            // Top bar
            context.beginPath();
            context.fillStyle = "#0f0821";
            context.fillRect(0, 0, 2000, 150);
            context.stroke();
            context.closePath();

            // FC Crest
            const portrait1 = await Canvas.loadImage(cheerioResults.crest[0]);
            context.drawImage(portrait1, 0, 0, 150, 150);
            const portrait2 = await Canvas.loadImage(cheerioResults.crest[1]);
            context.drawImage(portrait2, 0, 0, 150, 150);
            const portrait3 = await Canvas.loadImage(cheerioResults.crest[2]);
            context.drawImage(portrait3, 0, 0, 150, 150);

            // FC Name
            const fcName = `${cheerioResults.name} ${cheerioResults.tag}`;
            context.font = applySubText(canvas, fcName);
            context.fillStyle = 'WHITE';
            context.fillText(fcName, 155, 70);

            // Slogan
            const tag = cheerioResults.slogan[0];
            context.font = applyText(canvas, tag);
            context.fillStyle = 'WHITE';
            context.fillText(tag, 165, 120);

            // Formed
            const formed = `Founded on ${cheerioResults.formed[0]}`;
            context.font = applyText(canvas, formed);
            context.fillStyle = 'WHITE';
            context.fillText(formed, 15, 200);

            // Recruitment Status
            const recruitment = `Recruitment ${cheerioResults.recruitment}`;
            context.font = applyText(canvas, recruitment);
            context.fillStyle = 'WHITE';
            context.fillText(recruitment, 15, 265);

            // Leader
            const leader = `Captain: ${cheerioResults.founder}`;
            context.font = applyText(canvas, leader);
            context.fillStyle = 'WHITE';
            context.fillText(leader, 1300, 200);

            // Members
            const members = `Members: ${cheerioResults.members[0].trim()}/512`;
            context.font = applyText(canvas, members);
            context.fillStyle = 'WHITE';
            context.fillText(members, 1300, 265);

            // World rank
            const worldRank1 = cheerioResults.worldRank[0];
            context.font = applyText(canvas, worldRank1);
            context.fillStyle = 'WHITE';
            context.fillText(worldRank1, 15, 355);
            const worldRank2 = cheerioResults.worldRank[1];
            context.font = applyText(canvas, worldRank2);
            context.fillStyle = 'WHITE';
            context.fillText(worldRank2, 15, 420);


            // Focus and Seeking bar
            context.beginPath();
            context.fillStyle = "#0f0821";
            context.fillRect(0, 600, 2000, 300);
            context.stroke();
            context.closePath();

            // World and address
            const world = `${cheerioResults.world[0]}; ${cheerioResults.address[0]}`;
            context.font = applyText(canvas, world);
            context.fillStyle = 'WHITE';
            context.fillText(world, 15, 590);

            // Focus
            if(cheerioResults.focus && cheerioResults.focus.length > 0) {
                let attrX = 5;
                let attrY = 550;
                let focusCounter = 1;
                for await (const obj of cheerioResults.focus) {
                    if (focusCounter % 3 === 1) {
                        attrY = attrY + 100;
                        attrX = 100;
                    }

                    const focusObj = defaults.FOCUS.find(item => obj in item);
                    const focusIcon = await Canvas.loadImage(focusObj[obj]);
                    context.drawImage(focusIcon, attrX, attrY, 95, 95);

                    attrX = attrX + 90;
                    focusCounter++;
                };
            }

            // Seeking
            if(cheerioResults.seeking && cheerioResults.seeking.length > 0) {
                let attrX = 1400;
                let attrY = 550;
                let focusCounter = 1;
                for await (const obj of cheerioResults.seeking) {
                    if (focusCounter % 3 === 1) {
                        attrY = attrY + 100;
                        attrX = 1420;
                    }

                    const focusObj = defaults.SEEKING.find(item => obj in item);
                    const focusIcon = await Canvas.loadImage(focusObj[obj]);
                    context.drawImage(focusIcon, attrX, attrY, 95, 95);

                    attrX = attrX + 90;
                    focusCounter++;
                };
            }

            const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'selfportrait.png' });
            const dataUsage = "\n Powered by Lodestone";
            CommandAudit.createAudit(guildId, author, "fcstats");
            
            const url = `https://na.finalfantasyxiv.com/lodestone/freecompany/${fc}/`;
            const hiddenEmbed = hideLinkEmbed(url);
            await interaction.editReply({ content: ` :mag: Click the card to maximize\nFC Profile: ${hiddenEmbed}  ${dataUsage}`, files: [attachment] });


        } catch (error) {
            console.log("Encountered an error during fc retrieval: ", error);
            await interaction.editReply({ content: "Error", ephemeral: true });
        }
    }
};