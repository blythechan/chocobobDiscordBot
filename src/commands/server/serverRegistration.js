const Guilds = require ('../../statics/guildUtility');
const AdministrativeAction = require('../../schemas/administrativeAction');
const defaults = require('../../functions/tools/defaults.json');
const { customEmbedBuilder } = require('../../events/utility/handleEmbed');
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("server")
		.setDescription("Various server based commands. Retrieve status with /server")
		.addStringOption(option => option.setName("register")
			.setDescription("Register or De-Register from Chocobob?")
			.setAutocomplete(true)
			.setRequired(false))
		.addStringOption(option => option.setName("freecompanyid")
			.setDescription("Let Chocobob know your free company's Lodestone id to assist with lookups.")
			.setRequired(false))
		.addStringOption(option => option.setName("setnomroles")
			.setDescription("To allow `/nominate` to determine server roles, mention the roles you want to register.")
			.setRequired(false))
		.addBooleanOption(option => option.setName("clearnomroles")
			.setDescription("Remove registered roles for `/nomination`.")
			.setRequired(false))
		.addStringOption(option => option.setName("featherroles")
			.setDescription("To allow `/givefeathers` to determine and create server roles per category, ex: CATEGORY:ROLE_NAME.")
			.setRequired(false))
		.addStringOption(option => option.setName("featherrolelimit")
			.setDescription("To allow `/givefeathers` to determine when to give roles, ex: CATEGORY:NUMBER, Gathering:50.")
			.setRequired(false))
		.addBooleanOption(option => option.setName("status")
			.setDescription("Get the status of your server.")
			.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		const choices = ["Register", "Deregister"];
		const filtered = choices.filter((choice ) => choice .startsWith(focusedOption.value));
		await interaction.respond(filtered.map((choice ) => ({ name: choice , value: choice  })));
	},
	async execute(interaction) {

        let author = interaction.guild.members.cache.get(interaction.member.id);
		const userIsAdmin = author.permissions.has('ADMINISTRATOR');
        if(!userIsAdmin) {
            return interaction.reply({ content: 'Kweh! This command is restricted to server administrators only.', ephemeral: false });
        }
		
		// REGISTER CONFIG
		const choice = 					interaction.options.getString('register');
		const status = 					interaction.options.getBoolean('status');
		// FC THINGS
		const fcId =					interaction.options.getString("freecompanyid");
		// NOMINATE CONFIG
		const nomsPermissionList = 		interaction.options.getString('setnomroles');
		const clearnomroles = 			interaction.options.getBoolean('clearnomroles');
		// GIVEFEATHERS CONFIG
		const featherroles =			interaction.options.getString('featherroles');
		const featherrolelimit =		interaction.options.getString('featherrolelimit');
		// SERVER DOCUMENT
		const guildProfile = 			await Guilds.findByGuild(interaction.guild.id);

		//#region Verify if registered
		// Check if this server is recongized by bot
		if(choice !== "Register" && !status && !guildProfile) {
			const EMBED = customEmbedBuilder(
				"Server Not Registered with Chocobo Stall!",
				defaults.CHOCO_WIKI_ICON,
				"That command requires that your server is registered with Chocobob's Chocobo Stall.",
				[
					{ name: ":red_circle: Not Registered", value: `${guildProfile.registered}` },
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

		//#region Register free company (FC) id
		if(fcId && !choice && !status) {
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

		//#region clear nomination roles
		if(clearnomroles === true) {
			await Guilds.updateGuildRegisteredRoles(guildProfile.id, []);
			const EMBED = customEmbedBuilder(
				"Roles cleared for nominations in Chocobo Stall",
			);
			
			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
		}
		//#endregion

		//#region Retrieve server status with just `/server`
		if(status === true || (choice === null && nomsPermissionList === null)) {
			const listRoles = guildProfile.rolesRegistered.length > 0 
				? guildProfile.rolesRegistered.map(role => role.name)
				: "*None Registered*";
			const listFeatherCats = guildProfile.featherRoles.map(role => `\n**${role.cat}** "${role.role}" assigned if feathers are >= ${role.limit}`)
			const EMBED = customEmbedBuilder(
				"Chocobo Stall Status",
				defaults.CHOCO_WIKI_ICON,
				undefined,
				[
					{ name: ":green_circle: Registered", value: `${guildProfile.registered}` },
					{ name: `:notepad_spiral: ${interaction.guild.roles.cache.size} Total Server Roles`, value: " " },
					{ name: `:people_hugging: ${interaction.guild.memberCount} Total Members`, value: " " },
					{ name: `:heavy_check_mark: ${guildProfile.rolesRegistered.length} Server Roles Registered`, value: `${listRoles || " "}`},
					{ name: `:heavy_check_mark: ${guildProfile.featherRoles.length} Feather Categories`, value: `${listFeatherCats}`},
					{ name: "`/server` Help", value: "* *Remove registration*: `/server deregister`\n* *Register Roles*: `/server roles`\n* *Remove Registered Roles*: `/server clearnomroles`\n* *Create server roles per feather category* `/server featherroles`\n* *Role assignment limits for feathers* `/server featherrolelimit`" },
				]
			);

			return interaction.reply({
				embeds: [EMBED]
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

		//#region Register give feather roles `/givefeathers`
		if(featherroles) {
			const pairings = featherroles.split(",");
			let existingFeatherRoles = guildProfile.featherRoles;
			pairings.forEach(pair => {
				const [key, value] = pair.split(':');
				const catIdx = existingFeatherRoles.findIndex(item => item.cat === key.trim());
				existingFeatherRoles[catIdx].role = value.trim();
			});

			const result = await Guilds.updateGuildRegisteredRoles(guildProfile.id, false, existingFeatherRoles);
			const listRoles = result && result.featherRolesRegistered.length > 0 
				? result.featherRolesRegistered.map(role => `${role.cat}: ${role.name}`)
				: "*None Registered*";
			const EMBED = customEmbedBuilder(
				"Registered Feather Roles in Chocobo Stall",
				defaults.CHOCO_WIKI_ICON,
				undefined,
				[
					{ name: `:heavy_check_mark: ${result ? result.featherRolesRegistered.length : 0} Roles Registered for Feathers`, value: `${listRoles}` },
					{ name: ":yellow_circle: Purpose", value: `${defaults.DETAIL_TIDBITS[2]}` },	
					{ name: ":mag: Next Steps", value: "`/featherrolelimit` to set requirements of votes for role achievements" }		
				]
			);

			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
		}
		//#endregion

		//#region Set up vote limit requirements for feather roles `/givefeathers`
		if(featherrolelimit) {
			const pairings = featherrolelimit.split(",");
			let existingFeatherRoles = guildProfile.featherRoles;
			let throwError = false;
			pairings.forEach(pair => {
				const [key, value] = pair.split(':');
				const catIdx = existingFeatherRoles.findIndex(item => item.cat === key.trim());
				
				if(!isNaN(parseFloat(value.trim())) && isFinite(value.trim()) && parseInt(value.trim(), 10) >= 0) {
					existingFeatherRoles[catIdx].limit = parseInt(value.trim(), 10);
				} else {
					throwError = true;
				}
			});

			if(throwError === true) {
				const EMBED = customEmbedBuilder(
					"Command failed. Threshold value must be a number and be 0 or greater."
				);
				return interaction.reply({
					embeds: [EMBED],
					ephemeral: true
				});
			}

			const result = await Guilds.updateGuildRegisteredRoles(guildProfile.id, false, existingFeatherRoles);
			const listRoles = result && result.featherRolesRegistered.length > 0 
				? result.featherRolesRegistered.map(role => `${role.cat}: ${role.name}, requires ${role.limit} votes`)
				: "*None Registered*";
			const EMBED = customEmbedBuilder(
				"Registered Feather Roles in Chocobo Stall",
				defaults.CHOCO_WIKI_ICON,
				"Roles will be created when limit requirements are met.",
				[
					{ name: `:heavy_check_mark: ${result ? result.featherRolesRegistered.length : 0} Roles Registered for Feathers`, value: `${listRoles}` },
					{ name: ":yellow_circle: Purpose", value: `${defaults.DETAIL_TIDBITS[2]}` }		
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
				await Guilds.removeGuild(guildId);
				await AdministrativeAction.deleteMany({ guildId: guildProfile.guildId }).catch(console.error);
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