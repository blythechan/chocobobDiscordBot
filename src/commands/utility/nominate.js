const { SlashCommandBuilder } = require('discord.js');
const Nominations = require ('../../schemas/nominations');

///// TO DO: Add cooldown, but exlcude admin roles from cooldown.

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nominate')
		.setDescription('Nominate someone for a promotion!')
		.addUserOption(option => option.setName('user').setDescription('Which user do you want to nominate?').setRequired(false)),
	async execute(interaction, client) {
		const user = interaction.options.getUser("user");
		const guildId = interaction.guild.id;
		const nominator = interaction.guild.members.cache.get(interaction.member.id);
        
		await interaction.reply(`Not ready.`);
	}
};