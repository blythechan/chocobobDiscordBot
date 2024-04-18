const { SlashCommandBuilder } = require('discord.js');
const { customEmbedBuilder } = require('../../events/utility/handleEmbed');
const defaults = require('../../functions/tools/defaults.json');
const HeadpatCounter = require ('../../statics/headpatCounterUtility');
const CommandAudit = require ('../../statics/commandAuditUtility');
const Guilds = require ('../../statics/guildUtility');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('headpats')
		.setDescription('Praise Chocobob or a user with a head pat.')
        .addUserOption(option => option.setName('user').setDescription('Select the user to headpat otherwise leave blank to headpat the bot').setRequired(false)),
	async execute(interaction, client) {
		//await interaction.deferReply();

        const user = interaction.options.getUser("user");
		const headpatCategory = user && user.id !== defaults.BOT_ID
			? "user"
			: "bot";
		const guildProfile = await Guilds.findByGuild(interaction.guild.id);
		let author = interaction.guild.members.cache.get(interaction.member.id);

		let countHeadpats = 0;
		let roleAdded = [];
		let descStr = "";
		
		if(!guildProfile) {
			const CARD_EMBED_STATUS1 = new EmbedBuilder()
				.setTitle("Server Not Registered with Chocobo Stall!")
				.setColor(defaults.COLOR)
				.setDescription("This command requires that you be registered with Chocobob. Request a server administrator to use the `/server register` command.");
			
			return interaction.reply({
				embeds: [CARD_EMBED_STATUS1],
				ephemeral: true
			});
		}

		// // Verify command is past cooldown
		if(guildProfile && guildProfile.guildId) {
			const verifyCooldown = await CommandAudit.checkCooldown(guildProfile.guildId, author, "headpats", "1 minute");
			if(!verifyCooldown) {
				const messagecontent = defaults.DEFAULT_RESPONSES[1].replace("COOLDOWN_LIMIT", "1");
				const EMBED = customEmbedBuilder(
					undefined,
					defaults.CHOCO_SAD_ICON,
					messagecontent
				);
				return interaction.reply({
					embeds: [EMBED],
					ephemeral: true
				});
			}
		}

		if(user && user.id === author.id) {
			const EMBED = customEmbedBuilder(
				undefined,
				defaults.CHOCO_SAD_ICON,
				`You cannot give yourself a headpat.`
			);
			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
		}

		const result = await HeadpatCounter.giveHeadpats(interaction.user.id, headpatCategory, interaction.guild.id);
		const serverWideHeadpats = await HeadpatCounter.retrieveServerCount(interaction.guild.id);
		
		let overallHeadpats = serverWideHeadpats && serverWideHeadpats.length > 0 ? serverWideHeadpats[0].guildWideHeadpats : 0;

		// User is giving the bot headpats
		if(!user || (user && user.id === defaults.BOT_ID)) {
			countHeadpats = result.botHeadpats;
			if(guildProfile && guildProfile !== null && guildProfile.allowHeadpatRoles) {
				// Check if the BFF role is allowed
				let bffRole = guildProfile.headpatRoles.find(value => value.role === "Chocobob's BFF");
				// If it is then check if the limit has been passed to assign the role
				if(bffRole && result.botHeadpats > bffRole.limit) {
					const ASSIGN_ROLE = "Chocobob's BFF";
					let role = interaction.guild.roles.cache.find(role => role.name === ASSIGN_ROLE);
					if (!role) {
						role = await interaction.guild.roles.create({
							name: ASSIGN_ROLE,
							color: 'Grey',
							permissions: [],
							reason: 'Role created automatically by Chocobob'
						});
					} 

					// Verify if user has this role, if not then assign
					const guildUser = await interaction.guild.members.cache.get(author.id);
					if(!guildUser.roles.cache.some(r => r.name === ASSIGN_ROLE)) {
						// Adding the role to the user
						await guildUser.roles.add(role);
						roleAdded.push(ASSIGN_ROLE);
					}
				}
			}
			if(guildProfile && guildProfile.guildId) CommandAudit.createAudit(guildProfile.guildId, author, "headpats");
			descStr =`T-Thank you, ${interaction.user.username} kweh~ :pleading_face::heart:`;
			const EMBED = customEmbedBuilder(
				"Headpats",
				defaults.CHOCO_HAPPY_ICON,
				descStr,
				[
					{  name: ' ', value: `You have given Chocobob ${countHeadpats} ${countHeadpats > 1 ? "headpats" : "headpat" }`},
					{  name: ' ', value: `Server-Wide Headpats: ${overallHeadpats}`}
				]
			);
			return interaction.reply({
				embeds: [EMBED]
			});
		} else {
			countHeadpats = result.headpats;
			const guildProfile = await Guilds.findByGuild(interaction.guild.id);
			if(guildProfile && guildProfile !== null && guildProfile.allowHeadpatRoles) {
				// Check if there are any roles that we can assign as an achievement
				const availableRoles = guildProfile.headpatRoles.filter(value => value.limit < result.headpats && value.role !== "Chocobob's BFF");

				(availableRoles || []).map(async (hpRole) => {
					// Verify if user has this role, if not then assign
					const guildUser = interaction.guild.members.cache.get(author.id);
					if(!guildUser.roles.cache.some(r => r.name === hpRole.role)) {
						// Check if each role exists and apply it to the user
						let existingRole = interaction.guild.roles.cache.find(role => role.name === hpRole.role);
						if (!existingRole) {
							// Does not yet exist so create it
							existingRole = await interaction.guild.roles.create({
								name: hpRole.role,
								color: 'Grey',
								permissions: [],
								reason: 'Role created automatically by Chocobob'
							});
						} 
						// Adding the role to the user
						const member = await interaction.guild.members.fetch(author.id);
						await member.roles.add(existingRole);
						roleAdded.push(hpRole.role.toString());
					}
				});
			}
			if(guildProfile && guildProfile.guildId) CommandAudit.createAudit(guildProfile.guildId, author, "headpats");
			descStr = `:sparkles: ${interaction.user} gives ${user} a gentle head pat :sparkles:`;
			const EMBED = customEmbedBuilder(
				"Headpats",
				defaults.CHOCO_HAPPY_ICON,
				descStr,
				[
					{  name: ' ', value: `You have given ${countHeadpats} ${countHeadpats > 1 ? "headpats" : "headpat" } to users :heart:`},
					{  name: ' ', value: `Server-Wide Headpats: ${overallHeadpats}`}
				]
			);
			return interaction.reply({
				embeds: [EMBED]
			});
		}
	},
};
