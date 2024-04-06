const Guilds = require ('../../statics/guildUtility');
const AdministrativeAction = require('../../schemas/administrativeAction');
const defaults = require('../../functions/tools/defaults.json');
const { customEmbedBuilder } = require('../../events/utility/handleEmbed');
const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("serverfc")
		.setDescription("Various server free comapny based commands.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption(option =>  option.setName("freecompanyaddid").setDescription("Let Chocobob know your free company's Lodestone id to assist with lookups."))
		.addStringOption(option =>  option.setName("freecompanyremoveid").setDescription("Remove a registered free company id from the server."))
		.addBooleanOption(option =>  option.setName("freecompanyregistry").setDescription("See list of free company ids registered to this server."))
        .addBooleanOption(option => option.setName("allowautorole").setDescription("Allow auto roles when users /verify."))
        .addStringOption(option =>  option.setName("setautoroles").setDescription("Set roles for matching FC ex. inFC:Member, notIn:Guest"))
        .addBooleanOption(option => option.setName("allowrutoroleremoval").setDescription("Allow removal of fc role if user is not a part of fc"))
        .addStringOption(option =>  option.setName("cleanupfcroles").setDescription("Purge users with fc auto role that are not in fc")),
	async execute(interaction) {
        await interaction.deferReply();

        let author = interaction.guild.members.cache.get(interaction.member.id);
		const userIsAdmin = author.permissions.has('ADMINISTRATOR');
        if(!userIsAdmin) {
            return interaction.editReply({ content: 'Kweh! This command is restricted to server administrators only.', ephemeral: false });
        }
        
		// SERVER DOCUMENT
		const guildProfile              = await Guilds.findByGuild(interaction.guild.id);
        if(!guildProfile) {
            const EMBED = customEmbedBuilder(
                "Kweh! This server is not registered with Chocobo Stall. Please run `/server register` command."
			);
			
			return interaction.editReply({
				embeds: [EMBED],
                ephemeral: true
			});
        }

        // #region FC Removal
        const removeFreeCompany         = interaction.options.getString("freecompanyremoveid");
        if(removeFreeCompany && guildProfile && guildProfile.fcIds.includes(removeFreeCompany)) {
            await Guilds.updateFCId(guildProfile.guildId, removeFreeCompany, "remove");
            const EMBED = customEmbedBuilder(
                "FC Registry Updated",
                defaults.CHOCO_WIKI_ICON,
				`FC Id of ${removeFreeCompany} was removed from FC Registry`,
                [
                    { name: "Remove FC Id", value: "`/serverfc freecompanyremoveid" },
                    { name: "Add New FC Id", value: "`/serverfc freecompanyaddid" },
                    { name: "FC Registry", value: "`/serverfc freecompanyregistry" }
                ]
			);
			
			return interaction.editReply({
				embeds: [EMBED],
                ephemeral: true
			});
        } else if(guildProfile && guildProfile.fcIds.length > 0) {
            const EMBED = customEmbedBuilder(
                "FC Not Registered",
                defaults.CHOCO_WIKI_ICON,
				`FC Ids registered to this server: ${guildProfile.fcIds.join(", ")}`,
                [
                    { name: "Remove FC Id", value: "`/serverfc freecompanyremoveid" },
                    { name: "Add New FC Id", value: "`/serverfc freecompanyaddid" },
                    { name: "FC Registry", value: "`/serverfc freecompanyregistry" }
                ]
			);
			
			return interaction.editReply({
				embeds: [EMBED],
                ephemeral: true
			});
        } else if(guildProfile && guildProfile.fcIds.length === 0) { // FC id not recognized
            const EMBED2 = customEmbedBuilder(
                "FC Registry",
                defaults.CHOCO_SAD_ICON,
				`FC Ids registered to this server: 0`,
                [
                    { name: "Remove FC Id", value: "`/serverfc freecompanyremoveid" },
                    { name: "Add New FC Id", value: "`/serverfc freecompanyaddid" },
                    { name: "FC Registry", value: "`/serverfc freecompanyregistry" }
                ]
			);
			
			return interaction.editReply({
				embeds: [EMBED2],
                ephemeral: true
			});
        }
        //#endregion

        // #region FC Registry/Status
        const fcStatus                  = interaction.options.getBoolean("freecompanystatus");
        if(fcStatus && guildProfile && guildProfile.fcIds.length > 0) {
            const EMBED = customEmbedBuilder(
                "FC Registry",
                defaults.CHOCO_WIKI_ICON,
				`FC Ids registered to this server: ${guildProfile.fcIds.join(", ")}`,
                [
                    { name: "Remove FC Id", value: "`/serverfc freecompanyremoveid" },
                    { name: "Add New FC Id", value: "`/serverfc freecompanyaddid" },
                    { name: "FC Registry", value: "`/serverfc freecompanyregistry" }
                ]
			);
			
			return interaction.editReply({
				embeds: [EMBED],
                ephemeral: true
			});
        } else if(fcStatus && guildProfile && guildProfile.fcIds.length === 0) {
            const EMBED = customEmbedBuilder(
                "FC Registry",
                defaults.CHOCO_SAD_ICON,
				`FC Ids registered to this server: 0`,
                [
                    { name: "Remove FC Id", value: "`/serverfc freecompanyremoveid" },
                    { name: "Add New FC Id", value: "`/serverfc freecompanyaddid" },
                    { name: "FC Registry", value: "`/serverfc freecompanyregistry" }
                ]
			);
			
			return interaction.editReply({
				embeds: [EMBED],
                ephemeral: true
			});
        }
        // #endregion


		const fcId					    = interaction.options.getString("freecompanyaddid");
        if (!guildProfile.fcIds && !fcId) {
            const EMBED = customEmbedBuilder(
                "FC Registry",
                defaults.CHOCO_SAD_ICON,
				"Kweh! You must first register a Free Company Id with me via the `/serverfc freecompanyaddid` command."
			);
			
			return interaction.editReply({
				embeds: [EMBED],
                ephemeral: true
			});
        } else if (!guildProfile.fcIds.includes(fcId)) {
            const EMBED = customEmbedBuilder(
                "FC Registry",
                defaults.CHOCO_SAD_ICON,
				"Kweh! I do not recognize that Free Company Id out of the ones that are registered to this server."
			);
			
			return interaction.editReply({
				embeds: [EMBED],
                ephemeral: true
			});
        }

		// FC THINGS
        const allowAutoRole             = interaction.options.getBoolean("allowautorole");
        const setAutoRoles              = interaction.options.getBoolean("setautoroles");
        const allowAutoRoleRemoval      = interaction.options.getBoolean("allowAutoRoleRemoval");

        // #region Auto Roles based on FC
        if(allowAutoRole === true || allowAutoRole === false) {
            await Guilds.allowAutoRole(guildProfile.guildId, allowAutoRole);
            const sayThis = allowAutoRole === true
                ? `I will now apply an auto role to a user who verifies their FFXIV Lodestone account with me based on if they are a part of the registered server Free Company Id ${guildProfile.fcId}`
                : `I will **not** apply an auto role to a user who verifies their FFXIV Lodestone account with me based on if they are a part of the registered server Free Company Id ${guildProfile.fcId}`;
            const EMBED = customEmbedBuilder(
                "FC Registry",
                defaults.CHOCO_WOF_ICON,
                sayThis
            );
            
            return interaction.editReply({
                embeds: [EMBED],
                ephemeral: true
            });
        }

        if(allowAutoRoleRemoval === true || allowAutoRoleRemoval === false) {
            await Guilds.allowRemovalOfAutoRole(guildProfile.guildId, allowAutoRoleRemoval);
            const sayThis = allowAutoRoleRemoval === true
                ? `I will now remove any auto roles associated to a user who is not a member of the Free Company Id ${guildProfile.fcId} when you run /serverfc cleanupfcroles`
                : `I will **not** remove any roles when /serverfc cleanupfcroles is ran`;
            const EMBED = customEmbedBuilder(
                "FC Registry",
                defaults.CHOCO_WOF_ICON,
                sayThis
            );
            
            return interaction.editReply({
                embeds: [EMBED],
                ephemeral: true
            });
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

            const EMBED = customEmbedBuilder(
                "FC Registry",
                defaults.CHOCO_WOF_ICON,
                `Kweh! I just saved two roles to auto assign during character registration. ${memberRole} will be assigned if a registering user is a part of the registered FC. ${guestRole} will be assigned if a registering user is not a part of the regsitered FC.`
            );
            
            return interaction.editReply({
                embeds: [EMBED],
                ephemeral: true
            });
        }
        // #endregion

		//#region Register free company (FC) id
		if(fcId) {
			await Guilds.updateFCId(guildProfile.guildId, fcId, "modify");
			const EMBED = customEmbedBuilder(
				"Free Company Lodestone Id saved!"
			);
			return interaction.editReply({
				embeds: [EMBED],
				ephemeral: true
			});
		}
		//#endregion
	}
};