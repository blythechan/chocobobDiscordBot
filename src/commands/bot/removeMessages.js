const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const Guilds = require('../../schemas/guilds');
const AdministrativeAction = require('../../schemas/administrativeAction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Removes 100 messages within the last 2 weeks on current text-channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option.setName('user').setDescription('The user').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for message purge?')),
    async execute(interaction) {

        
		let author = interaction.guild.members.cache.get(interaction.member.id);
		const userIsAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if(!userIsAdmin) {
            return interaction.reply({ content: 'Kweh! This command is restricted to server administrators only.', ephemeral: false });
        }

        // Check if the bot has permission to manage roles
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'I do not have permission to manage messages.', ephemeral: false });
        }

        const regGuilds = await Guilds.findOne({ guildId: interaction.guild.id });

        const filterOldMessages = true;
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        const failure = "*Administrative Action.* An error occurred during message purge.";

        let loggedIt = false;
        let totalPurged = 0;

        interaction.channel.messages.fetch({
            limit: 100 // Can only do 100
        }).then((messages) => {
            let purgeMessages = messages.filter(m => m.author.id === user.id);
            if (purgeMessages.size === 0) {
                loggedIt = false;
                return interaction.reply(`*Administrative Action.*\n No messages were deleted. Ensure that messages are not over two weeks old.`);
            } else {
                interaction.channel.bulkDelete(purgeMessages, filterOldMessages)
                    .then((goodbyeMessages) => {
                        loggedIt = true;
                        totalPurged = goodbyeMessages.size;
                        return interaction.channel.send(`*Administrative Action.*\n Purged ${goodbyeMessages.size}/100 messages within the last 2 weeks belonging to ${user.username}. ${reason && reason !== "" ? `\n\n**Reason**: ${reason}` : ""}.\n\n${regGuilds ? `Action attempted logging into Chocobo Stall.` : "Administrative Action Logging requires server to be registered with Chocobob's Stall."}`);
                    }).catch(error => {
                        console.error(`Failed to delete: ${error}`);
                        return interaction.editReply(failure);
                    });
            }
        }).catch(error => {
            loggedIt = false;
            console.error(`Failed to delete: ${error}`);
            return interaction.reply(failure);
        });

        if (regGuilds && loggedIt) {
            const author = interaction.guild.members.cache.get(interaction.member.id);
            let logAction = await new AdministrativeAction({
                guildId: interaction.guild._id,
                memberId: author.user.id,
                command: `/purge ${user.username}#${user.discriminator} ${reason}`,
                outcome: `Purged ${totalPurged}/100 messages belonging to ${user.username}**Reason**: ${reason}`
            });
            await logAction.save().catch(console.error);
        }
    },
};