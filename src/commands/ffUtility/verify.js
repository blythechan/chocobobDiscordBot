const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Register with the Lodestone.'),
	async execute(interaction) {
		await interaction.reply(`Not ready.`);
	},
};