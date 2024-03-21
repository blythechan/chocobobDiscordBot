const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const AdministrativeAction = require('../../schemas/administrativeAction');
const Guilds = require('../../schemas/guilds');
const mongoose = require('mongoose');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('permission')
        .setDescription('Modify a user role. Server Administrators command.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option.setName('user').setDescription('Which user do you want to involve?').setRequired(true))
        .addStringOption(option => option.setName('action').setDescription('Remove/Add a role, Ban, or Kick').setAutocomplete(true).setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('Role to Remove/Add').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for permission change?').setRequired(true))
        .addBooleanOption(option => option.setName('notify').setDescription('Notify user of reason?').setRequired(true))
        .addBooleanOption(option => option.setName('ephemeral').setDescription('Only show the response to you?').setRequired(true)),
    async autocomplete(interaction, client) {
        const focusedValue = interaction.options.getFocused();
        const choices = ["Add", "Remove", "Ban", "Kick"];
        const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
        await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
    },
    async execute(interaction, client) {

        // Check if the bot has permission to manage roles
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: 'I do not have permission to manage roles.', ephemeral: false });
        }

        const regGuilds = await Guilds.findOne({ guildId: interaction.guild.id });

        const user = interaction.options.getUser('user');
        const action = interaction.options.getString('action').toLowerCase();
        const role = interaction.options.getRole('role');
        const reason = interaction.options.getString('reason');
        const notifyUser = interaction.options.getBoolean('notify');
        const ephemeral = interaction.options.getBoolean('ephemeral');

        if (!role) return interaction.reply({ content: `Action failed. Invalid role of "${role}". That role does not exist in the server. Role names must be exact.`, ephemeral: ephemeral });

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) return interaction.reply({ content: `Action failed. User "${user.username}#${user.discriminator}" does not appear to exist in this server.`, ephemeral: ephemeral });


        const hasRole = member.roles.cache.has(role.id);
        if (hasRole && action === 'add') {
            return interaction.reply({ content: `Action "add role" cannot complete. User ${user.username}#${user.discriminator} already has ${role} role assigned.`, ephemeral: ephemeral });
        } else if (!hasRole && action === 'remove') {
            return interaction.reply({ content: `Action "remove role" cannot complete. User ${user.username}#${user.discriminator} does not have that role, ${role}, assigned.`, ephemeral: ephemeral });
        }

        switch (action) {
            case 'remove':
                await member.roles.remove(role);
                break;
            case 'add':
                await member.roles.add(role);
                break;
            case 'ban':
                await member.roles.add(PermissionsBitField.Flags.BanMembers);
                break;
            case 'kick':
                await member.roles.add(PermissionsBitField.Flags.KickMembers);
                break;
            default:
                return interaction.reply({ content: `Invalid action. Actions such as Remove, Add, Ban, or Kick are recognized.`, ephemeral: ephemeral });
        }

        const sayThis = action === "add"
            ? `A new role, ${role.name}, has been assigned to you in `
            : action === "remove"
                ? `A role, ${role.name}, has been unassigned from you in `
                : `Your status has been changed to ${action} in `;

        const notifyThem = notifyUser
            ? `**Notification**: User was notified of this change via DM.`
            : `**Notification**: User was NOT notified of this change.`;

        const forAdmin = action === "add"
            ? `*Administrative Action.*\nRole, ${role.name}, has been **assigned** to ${user}.`
            : action === "remove"
                ? `*Administrative Action.*\nRole, ${role.name}, has been **unassigned** from ${user}.`
                : `*Administrative Action.*\n${user}'s server status has changed based off the following action: "${action}."`;
        let loggedIt = false;
        if (regGuilds) {
            const author = interaction.guild.members.cache.get(interaction.member.id);
            let logAction = await new AdministrativeAction({
                _id: new mongoose.Types.ObjectId(),
                guildId: interaction.guild._id,
                member: {
                    id: author.user.id,
                    username: author.user.username,
                    discriminator: author.user.discriminator
                },
                command: `/permissions ${user.username}#${user.discriminator} ${action} ${role.name} ${reason} ${notifyUser} ${ephemeral}`,
                outcome: `${forAdmin}\n\n**Reason**: ${reason}\n\n${notifyThem}`,
                actionTakenOn: Date().toString(),
            });
            await logAction.save().catch(console.error);
            loggedIt = logAction ? true : false;
        }
        if (notifyUser) {
            const ctx = `*DM received because you are a member of a mutual server: **${interaction.member.guild.name}**. Do not reply to this message.*\n\n${sayThis} **${interaction.member.guild.name}**.\n\n**Reason**: ${reason}`;
            member.send({ content: ctx })
                .then(sentMessage => {
                    interaction.reply({ content: `${forAdmin}\n\n**Reason**: ${reason}\n\n${notifyThem}\n\n${(loggedIt && regGuilds) ? `Action logged into Chocobo Stall.` : "Administrative Action Logging requires server to be registered with Chocobob's Stall."}`, ephemeral: ephemeral })
                })
                .catch(error => {
                    console.error(error.message);
                    interaction.reply({ content: `${forAdmin}\n\n**Reason**: ${reason}\n\n${notifyThem}`, ephemeral: ephemeral })
                });
        } else {
            interaction.reply({ content: `${forAdmin}\n\n**Reason**: ${reason}\n\n${notifyThem}\n\n${(loggedIt && regGuilds) ? `Action logged into Chocobo Stall.` : "Administrative Action Logging requires server to be registered with Chocobob's Stall."}`, ephemeral: ephemeral });
        }
    }
};