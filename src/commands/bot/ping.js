const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const defaults = require('../../functions/tools/defaults.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Check latency between client and bot.'),
	async execute(interaction, client) {
		const message = await interaction.deferReply({
			fetchReply: true
		});

		const CARD_EMBED_PONG= new EmbedBuilder()
			.setTitle("Ping Pong!")
			.setColor(defaults.COLOR)
			.setDescription(`:ping_pong: Client and Bot Relationship Latency is ${ message.createdTimestamp - interaction.createdTimestamp }ms, and API Latency is ${client.ws.ping}ms :ping_pong:`);
			
		return interaction.editReply({
			embeds: [CARD_EMBED_PONG],
			content: ""
		});
}
};