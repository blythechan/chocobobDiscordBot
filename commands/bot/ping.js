const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Check latency between client and bot.'),
	async execute(interaction) {
		await interaction.reply(`:ping_pong: Client and Bot Relationship Latency is ${Date.now() - interaction.createdTimestamp}ms :ping_pong:`);
	},
};