const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Check latency between client and bot.'),
	async execute(interaction, client) {
		const message = await interaction.deferReply({
			fetchReply: true
		});

		const newMessage = `:ping_pong: Client and Bot Relationship Latency is ${ message.createdTimestamp - interaction.createdTimestamp }ms, and API Latency is ${client.ws.ping}ms :ping_pong:`;
		await interaction.editReply({
			content: newMessage
		});
	}
};