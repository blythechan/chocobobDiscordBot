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
		.setName("server")
		.setDescription("Various server based commands. Retrieve status with /server")
		.addBooleanOption(option 	=> option.setName("help").setDescription("Get information on `/server` commands"))
		.addStringOption(option 	=> option.setName("register").setDescription("Register or De-Register from Chocobob?").setAutocomplete(true))
		.addStringOption(option 	=> option.setName("addfc").setDescription("Let Chocobob know your free company's Lodestone id to assist with lookups."))
		.addStringOption(option	 	=> option.setName("setnomroles").setDescription("To allow `/nominate` to determine server roles, mention the roles you want to register."))
		.addStringOption(option 	=> option.setName("nomroleexceptions").setDescription("Prevent users with specific roles to be nominated."))
		.addBooleanOption(option 	=> option.setName("clearnomroles").setDescription("Remove registered roles for `/nomination`."))
		.addBooleanOption(option 	=> option.setName("headpatrolesstatus").setDescription("When false, this prevents the bot from applying roles for headpats. Enabled by default."))
		.addStringOption(option 	=> option.setName("setheadpatroles").setDescription("Overwrite headpat roles, ex: Certified Headpatter:50, Midas Pets:99999"))
		.addBooleanOption(option 	=> option.setName("status").setDescription("Get the status of your server."))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		const choices = ["Register", "Deregister"];
		const filtered = choices.filter((choice ) => choice .startsWith(focusedOption.value));
		await interaction.respond(filtered.map((choice ) => ({ name: choice , value: choice  })));
	},
	async execute(interaction) {

        const author = interaction.guild.members.cache.get(interaction.member.id);
		const userIsAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if(!userIsAdmin) {
            return interaction.reply({ content: 'Kweh! This command is restricted to server administrators only.', ephemeral: false });
        }

		// #region Help
        const help                      = interaction.options.getBoolean("help");
        if(help) {
            const EMBED = customEmbedBuilder(
				"Server Commands",
                defaults.CHOCO_WIKI_ICON,
                undefined,
                [
                    { name: "Registration", value: " "},
                    { name: " ", value: "* Most commands require that the bot is registered with the server." },
                    { name: " ", value: "- `/server register:Register` This is to verify agreement for the bot to track commands for cooldown and data retrieval purposes on demand" },
                    { name: " ", value: "- `/server register:Deregister` The bot will clear out all data realted to your server." },
                    { name: "Nominations", value: " "},
                    { name: " ", value: "* Nominations allow your server community to nominate others for a promotion to a higher server rank." },
                    { name: " ", value: "- `/server setnomroles` This sets the specific roles that are available for promotions." },
                    { name: " ", value: "- `/server clearnomroles` This clears the specific roles that are available for promotions." },
                    { name: "Feathers", value: " "},
                    { name: " ", value: "* Feathers are like commendations or kudos." },
                    { name: "Headpats", value: " "},
                    { name: " ", value: "* Give someone or the bot a head pat." },
                    { name: " ", value: "- `/server headpatrolesstatus` When false, this prevents the bot from applying roles for headpats. This is enabled by default." },
                    { name: " ", value: "- `/server setheadpatroles` This sets roles that can be awarded for the number of headpats a user gives out." },
                ]
			);
			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
        }
        // #endregion

		const GUILD_ID = interaction.guild.id;

		// REGISTER CONFIG
		const choice = 					interaction.options.getString('register');
		const status = 					interaction.options.getBoolean('status');
		// FC THINGS
		const fcId =					interaction.options.getString("addfc");
		// NOMINATE CONFIG
		const nomsPermissionList = 		interaction.options.getString('setnomroles');
		const nomExceptions =			interaction.options.getString('nomroleexceptions');
		const clearnomroles = 			interaction.options.getBoolean('clearnomroles');
		// HEADPATS CONFIG
		const headpatrolestatus =		interaction.options.getBoolean('headpatrolesstatus');
		const setheadpatroles =			interaction.options.getString('setheadpatroles');
		// SERVER DOCUMENT
		const guildProfile = 			await Guilds.findByGuild(interaction.guild.id);

		//#region Verify if registered
		// Check if this server is recongized by bot
		if(choice !== "Register" && !status && guildProfile === null) {
			const EMBED = customEmbedBuilder(
				"Server Not Registered with Chocobo Stall!",
				defaults.CHOCO_WIKI_ICON,
				"That command requires that your server is registered with Chocobob's Chocobo Stall.",
				[
					{ name: ":red_circle: Not Registered", value: " " },
					{ name: `:notepad_spiral: ${interaction.guild.roles.cache.size} Total Server Roles`, value: " " },
					{ name: `:people_hugging: ${interaction.guild.memberCount} Total Members`, value: " " },
					{ name: "`/server` Help", value: "* *Register Server*: `/server register`\n* *Remove registration*: `/server deregister`\n* *Register Roles*: `/server roles`\n* *Remove Registered Roles*: `/server clearnomroles`" },
				]
			);
			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
		}
		//#endregion

		//#region headpat configuration
		if(headpatrolestatus === true || headpatrolestatus === false) {
			await Guilds.updateHeadpatRoles(guildProfile, headpatrolestatus);
			await AdministrativeAction.insertLog(GUILD_ID, author.id, "/server headpatrolesstatus", "modified head pat role status");
			const EMBED = customEmbedBuilder(
				`Headpat Roles ${headpatrolestatus ? "Enabled" : "Disabled"}`
			);
			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
		}

		if(setheadpatroles) {
			const keyValuePairs = setheadpatroles.split(',');
			const headpatRoles = keyValuePairs.map(pair => {
				const [key, value] = pair.split(':');
				return { role:key.trim(), limit:parseInt(value.trim()) };
			});
			await Guilds.updateHeadpatRoles(guildProfile, undefined, headpatRoles);
			await AdministrativeAction.insertLog(GUILD_ID, author.id, "/server setheadpatroles", "modified head pat roles");
			const EMBED = customEmbedBuilder(
				"Headpat Roles Created",
				undefined,
				`I overwrote my existing headpat roles and created ${headpatRoles.length} new roles`
			);
			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
		}
		//#endregion

		//#region Register free company (FC) id
		if(fcId && !choice && !status) {
			await Guilds.updateFCId(guildProfile.guildId, fcId, "modify");
			await AdministrativeAction.insertLog(GUILD_ID, author.id, "/server addfc", "modified server fc");
			const EMBED = customEmbedBuilder(
				"Free Company Lodestone Id saved!"
			);
			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
		}
		//#endregion

		//#region clear nomination roles
		if(clearnomroles === true) {
			await Guilds.updateGuildRegisteredRoles(guildProfile.id, []);
			await AdministrativeAction.insertLog(GUILD_ID, author.id, "/server clearnomroles", "modified nomination roles");
			const EMBED = customEmbedBuilder(
				"Roles cleared for nominations in Chocobo Stall",
			);
			
			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
		}
		//#endregion

		//#region Register nomination roles `/setnomroles`
		if(nomsPermissionList) {
			const roleIdRegex = /<@&(\d+)>/g;
			let rolesToRegisterArray = [];
			let match;
			while ((match = roleIdRegex.exec(nomsPermissionList)) !== null) {
				// Verify this role exists
				const role = interaction.guild.roles.cache.get(match[1]);
				if(role) {
					 rolesToRegisterArray.push({ id: role.id, name: role.name, rawPosition: role.rawPosition });
				}
			}
			const result = await Guilds.updateGuildRegisteredRoles(guildProfile.id, rolesToRegisterArray);
			await AdministrativeAction.insertLog(GUILD_ID, author.id, "/server setnomroles", "modified nomination roles");
			const listRoles = result && result.rolesRegistered.length > 0 
				? result.rolesRegistered.map(role => role.name)
				: "*None Registered*";
			const EMBED = customEmbedBuilder(
				"Registered Main Server Roles in Chocobo Stall",
				defaults.CHOCO_WIKI_ICON,
				undefined,
				[
					{ name: `:heavy_check_mark: ${result ? result.rolesRegistered.length : 0} Roles Registered for Nominations`, value: `${listRoles}` },
					{ name: ":yellow_circle: Purpose", value: `${defaults.DETAIL_TIDBITS[2]}` }				
				]
			);

			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
		}
		//#endregion

		if(nomExceptions) {
			const roleIdRegex = /<@&(\d+)>/g;
			let rolesToRegisterArray = [];
			let match;
			while ((match = roleIdRegex.exec(nomExceptions)) !== null) {
				// Verify this role exists
				const role = interaction.guild.roles.cache.get(match[1]);
				if(role) {
					rolesToRegisterArray.push({ role: role.name });
				}
			}
			const result = await Guilds.updateGuildExceptionRoles(guildProfile.id, rolesToRegisterArray);
			await AdministrativeAction.insertLog(GUILD_ID, author.id, "/server nomroleexceptions", "modified nomination exception roles");
			const listRoles = result && result.roleExceptions.length > 0 
				? result.roleExceptions.map(role => role.role)
				: "*No Exceptions Registered*";
			const EMBED = customEmbedBuilder(
				"Exception Server Roles in Chocobo Stall",
				defaults.CHOCO_WIKI_ICON,
				undefined,
				[
					{ name: `:heavy_check_mark: ${result ? result.roleExceptions.length : 0} Exception Roles for Nominations`, value: `${listRoles}` },
					{ name: ":yellow_circle: Purpose", value: `${defaults.DETAIL_TIDBITS[2]}` }				
				]
			);

			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
		}

		//#region Retrieve server status with just `/server`
		if(status === true || (choice === null && nomsPermissionList === null)) {
			const listRoles = guildProfile.rolesRegistered.length > 0 
				? guildProfile.rolesRegistered.map(role => role.name)
				: "*None Registered*";
			const listExceptionRoles = guildProfile.roleExceptions.length > 0 
				? guildProfile.roleExceptions.map(role => role.role)
				: "*None Registered*";
			const listFeatherCats = guildProfile.featherRoles.map(role => `\n**${role.cat}** "${role.role}" assigned if feathers are >= ${role.limit}`)
			const listHeadpats = guildProfile.allowHeadpatRoles 
				? guildProfile.headpatRoles.map(role => `\n**${role.role}** assigned if feathers are >= ${role.limit}`)
				: "Disabled";
			const EMBED = customEmbedBuilder(
				"Chocobo Stall Status",
				defaults.CHOCO_WIKI_ICON,
				undefined,
				[
					{ name: ":green_circle: Registered", value: `${guildProfile.registered}` },
					{ name: `:notepad_spiral: ${interaction.guild.roles.cache.size} Total Server Roles`, value: " " },
					{ name: `:people_hugging: ${interaction.guild.memberCount} Total Members`, value: " " },
					{ name: `:heavy_check_mark: ${guildProfile.rolesRegistered.length} Server Roles for Nominations`, value: `${listRoles || " "}`},
					{ name: `:heavy_check_mark: ${guildProfile.roleExceptions.length} Server Roles Excluded for Nominations`, value: `${listExceptionRoles || " "}`},
					{ name: `:heavy_check_mark: ${guildProfile.featherRoles.length} Feather Categories`, value: `${listFeatherCats}`},
					{ name: `:heavy_check_mark: ${guildProfile.headpatRoles.length} Headpat Roles`, value: `${listHeadpats}`},
					{ name: "`/server` Help", value: "* *Remove registration*: `/server deregister`\n* *Register Roles*: `/server roles`\n* *Remove Registered Roles*: `/server clearnomroles`" },
				]
			);

			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
		}
		//#endregion

		

		//#region Register/deregister the server 
		// REGISTER
		if (choice === "Register") {
			if (!guildProfile) { // does not exist
				await Guilds.registerGuild(interaction.guild);
				await AdministrativeAction.insertLog(GUILD_ID, author.id, "/server register", "server registered");
				const EMBED = customEmbedBuilder(
					"Registered in Chocobo Stall",
					defaults.CHOCO_WOF_ICON,
					undefined,
					[
						{ name: ":exclamation: Next Step", value: "Be sure to register your server's main permissions by using the `/server permissions` command, kweh!" },
						{ name: ":yellow_circle: Purpose", value: `${defaults.DETAIL_TIDBITS[0]}` }
					]
				);

				return interaction.reply({
					embeds: [EMBED],
					ephemeral: true
				});
			} else { // already exists
				const EMBED = customEmbedBuilder(
					"Registration Already Exists in Chocobo Stall",
					defaults.CHOCO_WOF_ICON,
					undefined,
					[
						{ name: ":green_circle: Registered", value: `${guildProfile.registered}` },
						{ name: ":yellow_circle: Purpose", value: `${defaults.DETAIL_TIDBITS[0]}` }
					]
				);
	
				return interaction.reply({
					embeds: [EMBED],
					ephemeral: true
				});
			}
		// DEREGISTER
		} else if (choice === "Deregister") {
			if (!guildProfile) { // does not exist
				const EMBED = customEmbedBuilder(
					"Registration Does Not Exist",
					defaults.CHOCO_WOF_ICON,
					"*Discord server does not appear to be registered to Chocobo Stall*."
				);
	
				return interaction.reply({
					embeds: [EMBED],
					ephemeral: true
				});
			} else { // already exists
				await Guilds.removeGuild(guildProfile.guildId);
				await CommandAudit.removeByGuildId(guildProfile.guildId);
				await Feathers.removeFeathersByGuildId(guildProfile.guildId);
				await Nominations.removeNominationByGuildId(guildProfile.guildId);
				await AdministrativeAction.deleteManyByGuildId({ guildId: guildProfile.guildId });
				const EMBED = customEmbedBuilder(
					"De-Registered from Chocobo Stall",
					defaults.CHOCO_WOF_ICON,
					`Server successfully deregistered. ${defaults.DETAIL_TIDBITS[1]}`
				);
	
				return interaction.reply({
					embeds: [EMBED],
					ephemeral: true
				});
			}
		}
		//#endregion
	}
};