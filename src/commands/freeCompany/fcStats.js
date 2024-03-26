const { AttachmentBuilder, SlashCommandBuilder, hideLinkEmbed  } = require("discord.js");
const { customEmbedBuilder } = require('../../events/utility/handleEmbed');
const CommandAudit = require('../../statics/commandAuditUtility');
const Guilds = require ('../../statics/guildUtility');
const defaults = require('../../functions/tools/defaults.json');
const scrapeLodestoneByFreeCompanyId = require('../../functions/tools/lodestoneScrape');
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
            .addStringOption(option => option.setName('fc').setDescription('The Free Company Id to request a stat card for')),
	async execute(interaction) {
        try {
            await interaction.deferReply();

            const guildId =                 interaction.guild.id;
            const guildProfile = 			await Guilds.findByGuild(interaction.guild.id);
            const author =                  interaction.guild.members.cache.get(interaction.member.id);
            const fc =                      interaction.options.getString('fc') || guildProfile.fcId;

            if((!fc || fc.trim() === "") && (!guildProfile.fcId || guildProfile.fcId === "")) {
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

            const finalRes = await scrapeLodestoneByFreeCompanyId(fc);
            if(!finalRes) {
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
            const portrait1 = await Canvas.loadImage(finalRes.fc.crest[0]);
            context.drawImage(portrait1, 0, 0, 150, 150);
            const portrait2 = await Canvas.loadImage(finalRes.fc.crest[1]);
            context.drawImage(portrait2, 0, 0, 150, 150);
            const portrait3 = await Canvas.loadImage(finalRes.fc.crest[2]);
            context.drawImage(portrait3, 0, 0, 150, 150);

            // FC Name
            const fcName = `${finalRes.fc.name} ${finalRes.fc.tag}`;
            context.font = applySubText(canvas, fcName);
            context.fillStyle = 'WHITE';
            context.fillText(fcName, 155, 70);

            // Slogan
            const tag = finalRes.fc.slogan[0];
            context.font = applyText(canvas, tag);
            context.fillStyle = 'WHITE';
            context.fillText(tag, 165, 120);

            // Formed
            const formed = `Founded on ${finalRes.fc.formed[0]}`;
            context.font = applyText(canvas, formed);
            context.fillStyle = 'WHITE';
            context.fillText(formed, 15, 200);

            // Recruitment Status
            const recruitment = `Recruitment ${finalRes.fc.recruitment}`;
            context.font = applyText(canvas, recruitment);
            context.fillStyle = 'WHITE';
            context.fillText(recruitment, 15, 265);

            // Leader
            const leader = `Captain: ${finalRes.members.founder[0]}`;
            context.font = applyText(canvas, leader);
            context.fillStyle = 'WHITE';
            context.fillText(leader, 1300, 200);

            // Members
            const members = `Members: ${finalRes.members.memberCount[0].trim()}/512`;
            context.font = applyText(canvas, members);
            context.fillStyle = 'WHITE';
            context.fillText(members, 1300, 265);

            // World rank
            const worldRank1 = finalRes.fc.world_rank[0][0];
            context.font = applyText(canvas, worldRank1);
            context.fillStyle = 'WHITE';
            context.fillText(worldRank1, 15, 355);
            const worldRank2 = finalRes.fc.world_rank[0][1];
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
            const world = `${finalRes.fc.gc[1]}; ${finalRes.fc.address[0]}`;
            context.font = applyText(canvas, world);
            context.fillStyle = 'WHITE';
            context.fillText(world, 15, 590);

            // Focus
            if(finalRes.fc.focus && finalRes.fc.focus[0]) {
                let attrX = 5;
                let attrY = 550;
                let focusCounter = 1;
                for await (const obj of finalRes.fc.focus[0]) {
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
            if(finalRes.fc.focus && finalRes.fc.focus[1]) {
                let attrX = 1400;
                let attrY = 550;
                let focusCounter = 1;
                for await (const obj of finalRes.fc.focus[1]) {
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