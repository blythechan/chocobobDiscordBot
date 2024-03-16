const fs = require('node:fs');
const { Client, GatewayIntentBits, Collection, AttachmentBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Embed } = require("discord.js");
const paginationEmbed = require('discordjs-v14-pagination');
require("dotenv").config();

const XIVAPI = require('@xivapi/js');
const xiv = new XIVAPI({
    private_key: process.env.FFXIV_API_KEY,
    language: 'en',
    snake_case: true
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fcexport')
        .setDescription('Exporting FC Members into a comma delimited text file.')
        .addStringOption(option => option.setName('fc').setDescription('The Free Company full name to request statistics from').setRequired(true))
        .addStringOption(option => option.setName('server').setDescription('The Free Company full name to request statistics from').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('The text channel to send the exported file to').setRequired(true)),
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const fc = interaction.options.getString('fc');
            const fcServer = interaction.options.getString('server');
            const channel = interaction.options.getChannel('channel');
            //find the FC with its name and server
            let res = await xiv.freecompany.search(fc, { server: fcServer });
            //get the FC ID
            let id = res.results[0].id;
            //get and return fc members
            let userFC = await xiv.freecompany.get(id, { data: 'FCM' });
            const fcm = userFC.free_company_members;

            if (fcm && fcm.length > 0) {
                let logText = [`The following text file is a list of ${userFC.free_company.name}'s members retrieved by Chocobob Bot.\n\n`];
                logText.push(["Name, Rank,\n"]);
                fcm.map(player => {
                    logText.push([`${player.name}, ${player.rank},\n`]);
                });

                try {
                    const fileName = `chocobobFCExport_${new Date().toDateString()}.txt`;
                    fs.writeFile(fileName, logText.toString(), (error) => {
                        if (error) {
                            console.error('Failed to create chocobobFCExport text file:', error);
                            interaction.reply({
                                content: `I could not retrieve the Free Company statistics during export.`
                            });
                            return;
                        }

                        const file = new AttachmentBuilder(fileName);

                        // Sending the file as an attachment
                        channel.send({ files: [file] });
                        interaction.editReply({ content: `Free Company statistics successfully exported to ${channel}.`, ephemeral: true })
                            .then(() => {
                                // Removing the temporary file
                                fs.unlink(fileName, (error) => {
                                    if (error) {
                                        console.error('Failed to delete text file:', error);
                                    }
                                });
                            })
                            .catch(error => {
                                console.error('Failed to send the file:', error);
                            });
                    });
                } catch (error) {
                    console.error(error);
                    interaction.reply({
                        content: `I could not retrieve the Free Company statistics during export.`
                    });
                }
            } else {
                interaction.reply({
                    content: `Something went wrong, kweh!`
                });
            }
        } catch (ex) {
            console.error(ex);
        }
    }
};