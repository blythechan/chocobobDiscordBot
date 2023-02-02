const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('headpats')
		.setDescription('Praise Chocobob with a head pat.'),
	async execute(interaction) {
		await interaction.reply(`T-Thank you, ${interaction.user.username} kweh~ :pleading_face::heart:`);
	},
};