const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fflogs')
		.setDescription('Retrieve a log from FFLogs.'),
	async execute(interaction) {
		await interaction.reply(`Not ready.`);
	},
};