const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Removes 100 messages within the last 2 weeks on current text-channel.')
        .addSubcommand(subcommand => 
            subcommand
                .setName('user')
                .setDescription('Purge specific user messages')
                .addUserOption(option => option.setName('user').setDescription('The user'))),
	async execute(interaction) {
        if(interaction.member.permissions.has([PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.BanMembers])) {
            const filterOldMessages = true;
            const user = interaction.options.getUser('user');
            interaction.channel.messages.fetch({
                limit: 100 // Can only do 100
            }).then((messages) => { 
                let purgeMessages = messages.filter(m => m.author.id === user.id);
                if(purgeMessages.size === 0 ) {
                    return interaction.reply(`No messages were deleted. Ensure that messages are not over two weeks old.`);
                } else {
                    interaction.channel.bulkDelete(purgeMessages, filterOldMessages).then(() => {
                        return interaction.channel.send(`Deleting ${purgeMessages.size} of ${user.username}'s messages. This message will self-destruct in 10 seconds.`)
                            .then(msg => { setTimeout(() => msg.delete(), 10000);})
                            .catch();
                    }).catch(error => {
                        console.log(`Failed to delete: ${error}`);
                        return interaction.editReply(`An error occurred.`);
                    })
                }
            }).catch(error => {
                console.log(`Failed to delete: ${error}`);
                return interaction.reply(`An error occurred.`);
            })
        } else {
            await interaction.reply(`Administrative permission required.`);
        }
	},
};