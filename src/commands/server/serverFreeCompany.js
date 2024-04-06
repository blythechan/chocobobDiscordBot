const Guilds = require ('../../statics/guildUtility');
const AdministrativeAction = require('../../statics/administrativeActionUtility');
const defaults = require('../../functions/tools/defaults.json');
const { customEmbedBuilder } = require('../../events/utility/handleEmbed');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("fc")
		.setDescription("Various server free comapny based commands.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addBooleanOption(option =>     option.setName("help").setDescription("Get information on `/fc` commands"))
		.addStringOption(option =>      option.setName("addfc").setDescription("Let Chocobob know your free company's Lodestone id to assist with lookups."))
		.addStringOption(option =>      option.setName("removefc").setDescription("Remove a registered free company id from the server."))
		.addBooleanOption(option =>     option.setName("registry").setDescription("See list of free company ids registered to this server."))
		.addBooleanOption(option =>     option.setName("roles").setDescription("See list of free company id related roles to this server."))
        .addBooleanOption(option =>     option.setName("allowautorole").setDescription("Allow auto roles when users /verify."))
        .addStringOption(option =>      option.setName("setautoroles").setDescription("Set roles for matching FC ex. inFC:Member, notIn:Guest"))
        .addBooleanOption(option =>     option.setName("allowautoroleremoval").setDescription("Allow removal of fc role if user is not a part of fc"))
        .addStringOption(option =>      option.setName("cleanupfcroles").setDescription("Purge users with fc auto role that are not in fc")),
	async execute(interaction) {
        await interaction.deferReply();

        let author = interaction.guild.members.cache.get(interaction.member.id);
		const userIsAdmin = author.permissions.has('ADMINISTRATOR');
        if(!userIsAdmin) {
            return interaction.editReply({ content: 'Kweh! This command is restricted to server administrators only.', ephemeral: false });
        }
        
		// SERVER DOCUMENT
		const guildProfile              = await Guilds.findByGuild(interaction.guild.id);

		const fcId					    = interaction.options.getString("addfc");
        const fcStatus                  = interaction.options.getBoolean("registry");
        const fcRoles                   = interaction.options.getBoolean("roles");

        if(!guildProfile) {
            const EMBED = customEmbedBuilder(
                "Kweh! This server is not registered with Chocobo Stall. Please run `/server register` command."
			);
			
			return interaction.editReply({
				embeds: [EMBED],
                ephemeral: true
			});
        } else if((!fcId && !fcStatus && !fcRoles) && guildProfile.fcIds.length === 0) {
            const EMBED = customEmbedBuilder(
                "FC Registry",
                defaults.CHOCO_SAD_ICON,
				`Free Company (FC) Ids registered to this server: 0`,
                [
                    { name: "FC Commands", value: " " },
                    { name: " ", value: "- Remove FC: `/fc removefc`"},
                    { name: " ", value: "- Add FC: `/fc addfc`" },
                    { name: " ", value: "- See all registered FCs: `/fc registry`" }
                ]
			);
			
			return interaction.editReply({
				embeds: [EMBED],
                ephemeral: true
			});
        }

        // #region Help
        const help                      = interaction.options.getBoolean("help");
        if(help) {
            const EMBED = customEmbedBuilder(
				"Free Company (FC) Commands",
                defaults.CHOCO_WIKI_ICON,
                undefined,
                [
                    { name: "FC Ids", value: " "},
                    { name: " ", value: "* An FC Id is required for some FFXIV related commands. You can have more than one Free Company Id; however, I will assume that the first FC you give me is your :sparkles:main:sparkles: FC." },
                    { name: " ", value: "- Don't know what the Id is? Find your FC profile on the Lodestone, and copy the number listed in the URL after */lodestone/freecompany/*." },
                    { name: " ", value: "- Start with `/fc registry`." },
                    { name: "Auto Roles", value: " "},
                    { name: " ", value: "* FC auto roles are used to verify a Discord user's membership in a registered FC." },
                    { name: " ", value: "- `/fc roles` Lists my current auto role settings." },
                    { name: " ", value: "- `/fc setautoroles` Applies a Discord role, if and only if `/fc allowautorole` is set to true, to a user based on if they are a member or they are not a member." },
                    { name: " ", value: "- `/fc cleanupfcroles` Removes Discord FC auto roles, if and only if `/fc allowautoroleremoval` is set to true, to a user who is no longer a part of the FC." }
                ],
                [ { text: "Disclaimer: Only North American Free Companies and Character retrievals are supported at this time." }]
			);
			return interaction.editReply({
				embeds: [EMBED],
				ephemeral: true
			});
        }
        // #endregion

        // #region List auto role things
        if(fcRoles) {
            const registeredAutoRoles = await Guilds.retrieveRoles(guildProfile.guildId);
            if(registeredAutoRoles) {
                const verifiedFCer      = registeredAutoRoles.autoFCRoleOnRegister[0] || "[Role Not Assigned]";
                const affiliatedFCer    = registeredAutoRoles.autoFCRoleOnRegister[1] || "[Role Not Assigned]";
                const EMBED = customEmbedBuilder(
                    "FC Roles",
                    defaults.CHOCO_WIKI_ICON,
                    "FC roles are applied when a user uses the `/verify` command. You can change the auto roles or prevent me from applying them at any time, kweh!",
                    [
                        { name: "Registered FCs", value: registeredAutoRoles.fcIds.join(", ") },
                        { name: "Auto Roles will apply on verify?", value: registeredAutoRoles.allowFCAutoRoleOnRegister ? "Yes" : "No"},
                        { name: "Change role next time user runs verify command?", value: registeredAutoRoles.allowRemoveFCRoleOnRegister ? "Yes" : "No"},
                        { name: "Roles Applied on Verify Command", value: " " },
                        { name: " ", value: `FC Member: ${verifiedFCer}` },
                        { name: " ", value: `FC Guest: ${affiliatedFCer}` },
                    ],
                    [ { text: "Disclaimer: Only North American Free Companies and Character retrievals are supported at this time." }]
                );
                return interaction.editReply({
                    embeds: [EMBED],
                    ephemeral: true
                });
            } else {
                const EMBED = customEmbedBuilder(
                    "Registered FC Roles",
                    defaults.CHOCO_WIKI_ICON,
                    "There are 0 registered FC roles"
                );
                return interaction.editReply({
                    embeds: [EMBED],
                    ephemeral: true
                });
            }
        }
        //#endregion

        
		//#region Register free company (FC) id
		if(fcId) {
			await Guilds.updateFCId(guildProfile.guildId, fcId, "modify");
			await AdministrativeAction.insertLog(guildProfile.guildId, author.id, "/server addfc", "modified server fc");
			const EMBED = customEmbedBuilder(
				"Free Company Lodestone Id saved!"
			);
			return interaction.editReply({
				embeds: [EMBED],
				ephemeral: true
			});
		}
		//#endregion

        // #region FC Removal
        const removeFreeCompany         = interaction.options.getString("removefc");
        if(removeFreeCompany && guildProfile && guildProfile.fcIds.includes(removeFreeCompany)) {
            await Guilds.updateFCId(guildProfile.guildId, removeFreeCompany, "remove");
			await AdministrativeAction.insertLog(guildProfile.guildId, author.id, "/server removefc", "removed server fc");
            const EMBED = customEmbedBuilder(
                "FC Registry Updated",
                defaults.CHOCO_WIKI_ICON,
				`Free Company (FC) Id of ${removeFreeCompany} was removed from FC Registry`,
                [
                    { name: "FC Commands", value: " " },
                    { name: " ", value: "- Remove FC: `/fc removefc`"},
                    { name: " ", value: "- Add FC: `/fc addfc`" },
                    { name: " ", value: "- See all registered FCs: `/fc registry`" }
                ],
                [ { text: "Disclaimer: Only North American Free Companies and Character retrievals are supported at this time." }]
			);
			
			return interaction.editReply({
				embeds: [EMBED],
                ephemeral: true
			});
        } else if(removeFreeCompany && guildProfile && guildProfile.fcIds.length > 0) {
            const EMBED = customEmbedBuilder(
                "FC Not Registered",
                defaults.CHOCO_WIKI_ICON,
				`Free Company (FC) Ids registered to this server: ${guildProfile.fcIds.join(", ")}`,
                [
                    { name: "FC Commands", value: " " },
                    { name: " ", value: "- Remove FC: `/fc removefc`"},
                    { name: " ", value: "- Add FC: `/fc addfc`" },
                    { name: " ", value: "- See all registered FCs: `/fc registry`" }
                ],
                [ { text: "Disclaimer: Only North American Free Companies and Character retrievals are supported at this time." }]
			);
			
			return interaction.editReply({
				embeds: [EMBED],
                ephemeral: true
			});
        } else if(removeFreeCompany && guildProfile && guildProfile.fcIds.length === 0) { // FC id not recognized
            const EMBED2 = customEmbedBuilder(
                "FC Registry",
                defaults.CHOCO_SAD_ICON,
				`Free Company (FC) Ids registered to this server: 0`,
                [
                    { name: "FC Commands", value: " " },
                    { name: " ", value: "- Remove FC: `/fc removefc`"},
                    { name: " ", value: "- Add FC: `/fc addfc`" },
                    { name: " ", value: "- See all registered FCs: `/fc registry`" }
                ],
                [ { text: "Disclaimer: Only North American Free Companies and Character retrievals are supported at this time." }]
			);
			
			return interaction.editReply({
				embeds: [EMBED2],
                ephemeral: true
			});
        }
        //#endregion

        // #region FC Registry/Status
        if(fcStatus && guildProfile && guildProfile.fcIds.length > 0) {
            const EMBED = customEmbedBuilder(
                "FC Registry",
                defaults.CHOCO_WIKI_ICON,
				`Free Company (FC) Ids registered to this server: ${guildProfile.fcIds.join(", ")}`,
                [
                    { name: "FC Commands", value: " " },
                    { name: " ", value: "- Remove FC: `/fc removefc`"},
                    { name: " ", value: "- Add FC: `/fc addfc`" },
                    { name: " ", value: "- See all registered FCs: `/fc registry`" }
                ],
                [ { text: "Disclaimer: Only North American Free Companies and Character retrievals are supported at this time." }]
			);
			
			return interaction.editReply({
				embeds: [EMBED],
                ephemeral: true
			});
        } else if(fcStatus && guildProfile && guildProfile.fcIds.length === 0) {
            const EMBED = customEmbedBuilder(
                "FC Registry",
                defaults.CHOCO_SAD_ICON,
				`Free Company (FC) Ids registered to this server: 0`,
                [
                    { name: "FC Commands", value: " " },
                    { name: " ", value: "- Remove FC: `/fc removefc`"},
                    { name: " ", value: "- Add FC: `/fc addfc`" },
                    { name: " ", value: "- See all registered FCs: `/fc registry`" }
                ],
                [ { text: "Disclaimer: Only North American Free Companies and Character retrievals are supported at this time." }]
			);
			
			return interaction.editReply({
				embeds: [EMBED],
                ephemeral: true
			});
        }
        // #endregion

        // if (!guildProfile.fcIds && !fcId) {
        //     const EMBED = customEmbedBuilder(
        //         "FC Registry",
        //         defaults.CHOCO_SAD_ICON,
		// 		"Kweh! You must first register a Free Company Id with me via the `/fc addfc` command."
		// 	);
			
		// 	return interaction.editReply({
		// 		embeds: [EMBED],
        //         ephemeral: true
		// 	});
        // } else if (!guildProfile.fcIds.includes(fcId)) {
        //     const EMBED = customEmbedBuilder(
        //         "FC Registry",
        //         defaults.CHOCO_SAD_ICON,
		// 		"Kweh! I do not recognize that Free Company Id out of the ones that are registered to this server."
		// 	);
			
		// 	return interaction.editReply({
		// 		embeds: [EMBED],
        //         ephemeral: true
		// 	});
        // }

        // #region Auto Roles based on FC
        const allowAutoRole             = interaction.options.getBoolean("allowautorole");
        const setAutoRoles              = interaction.options.getBoolean("setautoroles");
        const allowAutoRoleRemoval      = interaction.options.getBoolean("allowAutoRoleRemoval");
        if(allowAutoRole === true || allowAutoRole === false) {
            await Guilds.allowAutoRole(guildProfile.guildId, allowAutoRole);
            const sayThis = allowAutoRole === true
                ? `I will now apply an auto role to a user who verifies their FFXIV Lodestone account with me based on if they are a part of the registered server Free Company Id ${guildProfile.fcIds[0]}`
                : `I will **not** apply an auto role to a user who verifies their FFXIV Lodestone account with me based on if they are a part of the registered server Free Company Id ${guildProfile.fcIds[0]}`;
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
                ? `I will now remove any auto roles associated to a user who is not a member of the Free Company Id ${guildProfile.fcIds[0]} when you run /fc cleanupfcroles`
                : `I will **not** remove any roles when /fc cleanupfcroles is ran`;
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
	}
};