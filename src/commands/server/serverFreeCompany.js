const Guilds = require ('../../statics/guildUtility');
const AdministrativeAction = require('../../schemas/administrativeAction');
const defaults = require('../../functions/tools/defaults.json');
const { customEmbedBuilder } = require('../../events/utility/handleEmbed');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("server")
		.setDescription("Various server free comapny based commands.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption(option => option.setName("freecompanyid").setDescription("Let Chocobob know your free company's Lodestone id to assist with lookups.").setRequired(false))
        .addBooleanOption(option => option.setName("allowautorole").setDescription("Allow auto roles when users /verify.").setRequired(false))
        .addStringOption(option => option.setName("setautoroles").setDescription("Set roles for matching FC ex. inFC:Member, notIn:Guest"))
        .addBooleanOption(option => option.setName("allowrutoroleremoval").setDescription("Allow removal of fc role if user is not a part of fc"))
        .addStringOption(option => option.setName("cleanupfcroles").setDescription("Purge users with fc auto role that are not in fc")),
	async execute(interaction) {

        let author = interaction.guild.members.cache.get(interaction.member.id);
		const userIsAdmin = author.permissions.has('ADMINISTRATOR');
        if(!userIsAdmin) {
            return interaction.reply({ content: 'Kweh! This command is restricted to server administrators only.', ephemeral: false });
        }
        
		// SERVER DOCUMENT
		const guildProfile              = await Guilds.findByGuild(interaction.guild.id);
		const fcId					    = interaction.options.getString("freecompanyid");
        if(!guildProfile) {
            return interaction.reply({ content: 'Kweh! This server is not registered with Chocobo Stall. Please run `/server register` command.', ephemeral: true });
        } else if (!guildProfile.fcId && !fcId) {
            return interaction.reply({ content: 'Kweh! You must first register a Free Company Id with me via the `/serverfreecompany freecompanyid` command.', ephemeral: true });
        }

		// FC THINGS
        const allowAutoRole             = interaction.options.getBoolean("allowautorole");
        const setAutoRoles              = interaction.options.getBoolean("setautoroles");
        const allowAutoRoleRemoval      = interaction.options.getBoolean("allowAutoRoleRemoval");

        if(allowAutoRole === true || allowAutoRole === false) {
            await Guilds.allowAutoRole(guildProfile.guildId, allowAutoRole);
            const sayThis = allowAutoRole === true
                ? `I will now apply an auto role to a user who verifies their FFXIV Lodestone account with me based on if they are a part of the registered server Free Company Id ${guildProfile.fcId}`
                : `I will **not** apply an auto role to a user who verifies their FFXIV Lodestone account with me based on if they are a part of the registered server Free Company Id ${guildProfile.fcId}`;
            return interaction.reply({ content: sayThis, ephemeral: true });
        }

        if(allowAutoRoleRemoval === true || allowAutoRoleRemoval === false) {
            await Guilds.allowRemovalOfAutoRole(guildProfile.guildId, allowAutoRoleRemoval);
            const sayThis = allowAutoRoleRemoval === true
                ? `I will now remove any auto roles associated to a user who is not a member of the Free Company Id ${guildProfile.fcId} when you run /serverfreecompany cleanupfcroles`
                : `I will **not** remove any roles when /serverfreecompany cleanupfcroles is ran`;
            return interaction.reply({ content: sayThis, ephemeral: true });
        }

        if(setAutoRoles) {
            const parts = setAutoRoles.split(/[:,]/);
            const result = parts
                .filter((part, index) => index % 2 !== 0)
                .map(value => value.trim());
            await Guilds.setAutoRoles(guildProfile.guildId, result);
            const guestRole = result[1] && result[1] !== null && result[1] !== undefined 
                ? result[1]
                : "[No Roles to Assign]";
            const memberRole = result[0] && result[0] !== null && result[0] !== undefined 
                ? result[1]
                : "[No Roles to Assign]";
            return interaction.reply({ content: `Kweh! I just saved two roles to auto assign during character registration. ${memberRole} will be assigned if a registering user is a part of the registered FC. ${guestRole} will be assigned if a registering user is not a part of the regsitered FC.`, ephemeral: true });
        }

		//#region Register free company (FC) id
		if(fcId) {
			await Guilds.updateGuildFreeCompanyId(guildProfile.id, fcId);
			const EMBED = customEmbedBuilder(
				"Free Company Lodestone Id saved!"
			);
			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
		}
		//#endregion
	}
};