const Guilds = require ('../../statics/guildUtility');
const AdministrativeAction = require('../../schemas/administrativeAction');
const defaults = require('../../functions/tools/defaults.json');
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("server")
		.setDescription("Various server based commands. Retrieve status with /server")
		.addStringOption(option => option.setName("register").setDescription("Register or De-Register from Chocobob?").setAutocomplete(true).setRequired(false))
		.addStringOption(option => option.setName("roles").setDescription("To allow `/nominate`, mention the roles you want to register.").setRequired(false))
		.addBooleanOption(option => option.setName("clearroles").setDescription("Remove registered roles.").setRequired(false))
		.addBooleanOption(option => option.setName("status").setDescription("Get the status of your server.").setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		const choices = ["Register", "Deregister"];
		const filtered = choices.filter((choice ) => choice .startsWith(focusedOption.value));
		await interaction.respond(filtered.map((choice ) => ({ name: choice , value: choice  })));
	},
	async execute(interaction) {
		const choice = interaction.options.getString('register');
		const permissionList = interaction.options.getString('roles');
		const status = interaction.options.getBoolean('status');
		const clearroles = interaction.options.getBoolean('clearroles');
		const guildProfile = await Guilds.findByGuild(interaction.guild.id);
		if(clearroles === true) {
			if(!guildProfile) {
				const CARD_EMBED_STATUS1 = new EmbedBuilder()
					.setTitle("Server Not Registered with Chocobo Stall!")
					.setColor(defaults.COLOR)
					.setDescription(`Role registration first requires that your server is registered with Chocobob's Chocobo Stall.`)
					.setThumbnail(defaults.CHOCO_WIKI_ICON)
					.addFields(
					{ name: ":red_circle: Not Registered", value: `${guildProfile.registered}` },
					{ name: `:notepad_spiral: ${interaction.guild.roles.cache.size} Total Server Roles`, value: " " },
					{ name: `:people_hugging: ${interaction.guild.memberCount} Total Members`, value: " " },
					{ name: "`/server` Help", value: "* *Register Server*: `/server register`\n* *Remove registration*: `/server deregister`\n* *Register Roles*: `/server roles`\n* *Remove Registered Roles*: `/server clearroles`" },
					);
				
				return interaction.reply({
					embeds: [CARD_EMBED_STATUS1]
				});
			} else {
				await Guilds.updateGuildRegisteredRoles(guildProfile.id, []);
				const CARD_EMBED_REG = new EmbedBuilder()
					.setTitle("Roles Cleared in Chocobo Stall")
					.setColor(defaults.COLOR);
					
				return interaction.reply({
					embeds: [CARD_EMBED_REG],
					ephemeral: true
				});
			}
		}
		if(status === true || (choice === null && permissionList === null)) {
			if(!guildProfile) {
				const CARD_EMBED_STATUS1 = new EmbedBuilder()
					.setTitle("Server Not Registered with Chocobo Stall!")
					.setColor(defaults.COLOR)
					.setDescription(`Role registration first requires that your server is registered with Chocobob's Chocobo Stall.`)
					.setThumbnail(defaults.CHOCO_WIKI_ICON)
					.addFields(
					{ name: ":red_circle: Not Registered", value: `${guildProfile.registered}` },
					{ name: `:notepad_spiral: ${interaction.guild.roles.cache.size} Total Server Roles`, value: " " },
					{ name: `:people_hugging: ${interaction.guild.memberCount} Total Members`, value: " " },
					{ name: "`/server` Help", value: "* *Register Server*: `/server register`\n* *Remove registration*: `/server deregister`\n* *Register Roles*: `/server roles`\n* *Remove Registered Roles*: `/server clearroles`" },
					);
				
				return interaction.reply({
					embeds: [CARD_EMBED_STATUS1]
				});
			} else {
				const listRoles = guildProfile.rolesRegistered.length > 0 
					? guildProfile.rolesRegistered.map(role => role.name)
					: "*None Registered*";
				const CARD_EMBED_STATUS2 = new EmbedBuilder()
					.setTitle("Chocobo Stall Status")
					.setColor(defaults.COLOR)
					.setThumbnail(defaults.CHOCO_WIKI_ICON)
					.addFields(
						{ name: ":green_circle: Registered", value: `${guildProfile.registered}` },
						{ name: `:notepad_spiral: ${interaction.guild.roles.cache.size} Total Server Roles`, value: " " },
						{ name: `:people_hugging: ${interaction.guild.memberCount} Total Members`, value: " " },
						{ name: `:heavy_check_mark: ${guildProfile.rolesRegistered.length} Roles Registered`, value: `${listRoles || " "}`},
						{ name: "`/server` Help", value: "* *Remove registration*: `/server deregister`\n* *Register Roles*: `/server roles`\n* *Remove Registered Roles*: `/server clearroles`" },
					);
				
				return interaction.reply({
					embeds: [CARD_EMBED_STATUS2]
				});
			}
		}
		if(permissionList) {
			if(!guildProfile) { // Only continue if server is registered
				const CARD_EMBED_REG = new EmbedBuilder()
					.setTitle("Server Not Registered with Chocobo Stall!")
					.setColor(defaults.COLOR)
					.setDescription(`Role registration first requires that your server is registered with Chocobob's Chocobo Stall.`)
					.setThumbnail(defaults.CHOCO_WIKI_ICON)
					.addFields(
						{ name: ":exclamation: Command", value: "`/server register`" },
						{ name: ":yellow_circle: Purpose", value: `${defaults.DETAIL_TIDBITS[0]}` }
					);
				
				return interaction.reply({
					embeds: [CARD_EMBED_REG],
					ephemeral: true
				});
			}
			const roleIdRegex = /<@&(\d+)>/g;

			let rolesToRegisterArray = [];
			let match;
			while ((match = roleIdRegex.exec(permissionList)) !== null) {
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
			const CARD_EMBED_REG = new EmbedBuilder()
				.setTitle("Registered Roles in Chocobo Stall")
				.setColor(defaults.COLOR)
				.setThumbnail(defaults.CHOCO_WIKI_ICON)
				.addFields(
					{ name: `:heavy_check_mark: ${result ? result.rolesRegistered.length : 0} Roles Registered`, value: `${listRoles}` },
					{ name: ":yellow_circle: Purpose", value: `${defaults.DETAIL_TIDBITS[2]}` }
				);
				
			return interaction.reply({
				embeds: [CARD_EMBED_REG],
				ephemeral: true
			});
		}
		if (choice === "Register") {
			if (!guildProfile) {
				await Guilds.registerGuild(interaction.guild);
				const CARD_EMBED_REG = new EmbedBuilder()
					.setTitle("Registered in Chocobo Stall")
					.setColor(defaults.COLOR)
					.setThumbnail(defaults.CHOCO_WOF_ICON)
					.addFields(
						{ name: ":exclamation: Next Step", value: "Be sure to register your server's main permissions by using the `/server permissions` command, kweh!" },
						{ name: ":yellow_circle: Purpose", value: `${defaults.DETAIL_TIDBITS[0]}` }
					);
					
				return interaction.reply({
					embeds: [CARD_EMBED_REG],
					ephemeral: true
				});
			} else {
				const CARD_EMBED_ALR_REG = new EmbedBuilder()
					.setTitle("Registration Already Exists in Chocobo Stall")
					.setColor(defaults.COLOR)
					.setThumbnail(defaults.CHOCO_WOF_ICON)
					.addFields(
						{ name: ":green_circle: Registered", value: `${guildProfile.registered}` },
						{ name: ":yellow_circle: Purpose", value: `${defaults.DETAIL_TIDBITS[0]}` }
					);
					
				return interaction.reply({
					embeds: [CARD_EMBED_ALR_REG],
					ephemeral: true
				});
			}
		} else if (choice === "Deregister") {
			if (!guildProfile) {
				await interaction.reply({
					content: `*Discord server does not appear to be registered to Chocobo Stall*.`, ephemeral: true
				});
			} else {
				await Guilds.removeGuild(guildId);
				await AdministrativeAction.deleteMany({ guildId: guildProfile.guildId }).catch(console.error);
				const CARD_EMBED_DEREG= new EmbedBuilder()
					.setTitle("De-Registered from Chocobo Stall")
					.setThumbnail(defaults.CHOCO_WOF_ICON)
					.setColor(defaults.COLOR)
					.setDescription(`Server successfully deregistered. ${defaults.DETAIL_TIDBITS[1]}`);;
						
				return interaction.reply({
					embeds: [CARD_EMBED_DEREG],
					ephemeral: true
				});

			}
		}
	}
};