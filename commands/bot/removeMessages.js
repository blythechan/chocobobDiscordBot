const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { CLIENT_ID } = require("dotenv").config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Removes 100 messages from specific text-channel within the last 2 weeks on current text-channel.')
        .addBooleanOption(option => option.setName('old').setDescription('Whether or not messages > 14 days should be removed, true by default').setRequired(false)),
	async execute(interaction) {
        if(interaction.member.permissions.has([PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.BanMembers])) {
            
        const filterOldMessages = interaction.options.getBoolean('old') ?? true;
            
            
            interaction.channel.messages.fetch({
                limit: 100 // Change `100` to however many messages you want to fetch
            }).then((messages) => { 
                const botMessages = [];
                messages.filter(m => m.author.id === CLIENT_ID).forEach(msg => botMessages.push(msg));
                console.log("messages:", botMessages);
                interaction.channel.bulkDelete(botMessages, filterOldMessages).then(() => {
                    interaction.channel.send("Cleared bot messages").then(msg => msg.delete({
                        timeout: 3000
                    }))
                }).catch(error => {
                    console.log(`Failed to delete: ${error}`);
                        return interaction.reply(`An error occurred.`);
                    })
            }).catch(error => {
                console.log(`Failed to delete: ${error}`);
                return interaction.reply(`An error occurred.`);
            })
            
            
            
            // interaction.channel.bulkDelete(100, true)
            //     .then((message) => {
            //         console.log("testing:",message)
            //         return interaction.reply(`Removed ${message.size} messages.`).then(replyMessage => { setTimeout(() => interaction.deleteReply(), 5000)})})
            //     .catch(error => {
            //         console.log(`Failed to delete: ${error}`);
            //         return interaction.reply(`An error occurred.`);
            //     });
        } else {
            await interaction.reply(`Administrative permission required.`);
        }
	},
};