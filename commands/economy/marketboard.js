const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mb')
		.setDescription('Temp description.'),
	async execute(interaction) {
		await interaction.reply(`Not ready yet.`);
	},
};