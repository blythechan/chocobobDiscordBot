const { SlashCommandBuilder, roleMention, userMention } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ship')
		.setDescription('Ship a user in your server to another user in your server')
        .addStringOption(option => option.setName('shipa').setDescription('Mention the first user').setRequired(true))
        .addStringOption(option => option.setName('shipb').setDescription('Mention the second user').setRequired(true)),
	async execute(interaction) {
        const matchRate = Math.round(Math.random() * 99) + 1;
        
        const shipA = interaction.options.getString('shipa');
        const shipB = interaction.options.getString('shipb');
        //const shipA = interaction.user.displayAvatarURL();
        const user = userMention(id);
        await interaction.reply(`Test...`);
	},
};