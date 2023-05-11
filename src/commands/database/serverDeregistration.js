const Guild = require('../../schemas/guild');
const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverderegister')
        .setDescription('De-registers your server with Chocobob.')
        .addBooleanOption(option => option.setName('remove').setDescription('Remove server registration from Chocobob (true is yes, false is no)?').setRequired(true)),
    async execute(interaction, client) {
        const deregistering = `Removing a server from Chocobob's Stall means that any logs or data captured by Chocobob will be removed. No administrative commands, FFXIV player Lodestone registering, or other logs will be saved. Chocobob **does not** require a server to be registered.`;
        let guildProfile = await Guild.findOne({ guildId: interaction.guild.id });
        if (!guildProfile) {
            await interaction.reply({
                content: `*Server does not appear to be registered to Chocobo Stall*.`
            });
        } else {
            await guildProfile.deleteOne({ guildId: guildProfile.guildId }).catch(console.error);
            await interaction.reply({
                content: `*Server was removed from the Chocobo Stall Database*.\n\n${deregistering}`
            });

        }
    }
};