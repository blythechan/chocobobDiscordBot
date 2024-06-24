const Guilds = require ('../../statics/guildUtility');
const AdministrativeAction = require('../../statics/administrativeActionUtility');
const defaults = require('../../functions/tools/defaults.json');
const { customEmbedBuilder } = require('../../events/utility/handleEmbed');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CommandAudit = require('../../statics/commandAuditUtility');
const Nominations = require('../../statics/nominationsUtility');
const Feathers = require('../../statics/feathersUtility');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("featherconfig")
		.setDescription("Feathers configuration")
            .addStringOption(option     => option.setName("setlimit").setDescription("Set amount of feathers for role. EX: Combat:Warrior:25"))
            .addUserOption(option       => option.setName("user").setDescription("Remove feathers from a user"))
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
        const author = interaction.guild.members.cache.get(interaction.member.id);
		const userIsAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if(!userIsAdmin) {
            return interaction.reply({ content: 'Kweh! This command is restricted to server administrators only.', ephemeral: true });
        }

        // FEATHER CONFIGS
		const setLimit = interaction.options.getString('setlimit');
        const user = interaction.options.getUser("user");

        // #region Remove Feathers from User
        if(user && user !== null) {
            await Feathers.removeFeathersByGuildMember(interaction.guild.id, user.id);
            await AdministrativeAction.insertLog(interaction.guild.id, author.id, "/featherconfig user", `removed ${user.id}'s feathers`);
            return interaction.reply({ content: `Kweh! All feathers associated with ${user} have been removed. You must remove server roles that were related manually.`, ephemeral: true });
        }
        // #endregion

        // #region Set Feather Limit
        if(setLimit && setLimit !== "" && setLimit !== null) {
            try { 
                const pieces = setLimit.split(":");
                // Vet the values, we need 3 pieces
                if(pieces.length !== 3)  {
                    return interaction.reply({ content: 'Kweh! To change a limt, I need 3 values. Example: Combat:Warrior:25 or Category:Role:NumberOfFeathersForRole.', ephemeral: true });
                } else if(pieces[2] && parseInt(pieces[2].trim())) { // Ensure we were given an integer for the limit
                    return interaction.reply({ content: 'Kweh! To change a limt, I need 3 values. Example: Combat:Warrior:25 or Category:Role:NumberOfFeathersForRole.', ephemeral: true });
                }
                
                const result = await Guilds.updateGuildFeatherLimits(interaction.guild.id, pieces[0], pieces[1], pieces[2]);
                if(result && result !== null) {
                    await AdministrativeAction.insertLog(interaction.guild.idd, author.id, "/featherconfig setlimit", `modified limit for ${pieces[0]}:${pieces[1]}`);
                }
            } catch (error) {
                console.error(`Encountered error during feather limit configuration. `, error);
            }
        }
        // #endregion
	}
};