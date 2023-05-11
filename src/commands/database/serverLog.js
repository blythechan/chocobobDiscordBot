const fs = require('fs');
const mongoose = require('mongoose');
const Guild = require('../../schemas/guild');
const AdministrativeAction = require('../../schemas/administrativeAction');
const { SlashCommandBuilder, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription('Review the latest 50 server administrative actions. Server Administrators command.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        let guildProfile = await Guild.findOne({ guildId: interaction.guild.id });
        if (!guildProfile) {
            return interaction.reply({
                content: `*Administrative Action.* This command requires that your server be registered with Chocobob. To register, use the ${`/server register`} command.`
            });
        } else {
            const logs = await AdministrativeAction.find({}).where({ guildId: interaction.guild._id }).sort({ _id: -1 }).limit(50);
            
            if (logs && logs.length > 0) {
                let counter = 0;
                let logText = [ "The following text file is a list of the latest 50 actions logged by Chocobob Bot in your server.\n\n" ];
                logs.map(logIt => {
                    counter++;
                    logText.push([`${counter}. ${logIt.actionTakenOn} - ${logIt.member.username}#${logIt.member.discriminator} ran the following command ${logIt.command}. **Outcome**: ${logIt.outcome}\n\n`]);

                });

                try {
                    const fileName = "chocobobServerLogs.txt";
                    fs.writeFile(fileName, logText.toString(), (error) => {
                        if (error) {
                            console.error('Failed to create chocobobServerLogs text file:', error);
                            return;
                        }

                        const file = new AttachmentBuilder (fileName);

                        // Sending the file as an attachment
                        interaction.reply({ files: [file] })
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
                        content: `I could not retrieve the logs pertaining to your server.`
                    });
                }
            } else {
                interaction.reply({
                    content: `I do not appear to have any logs pertaining to your server in my Chocobo Stall.`
                });
            }
        }
    }
};