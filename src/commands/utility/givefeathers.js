const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const Feathers = require ('../../statics/feathersUtility');
const Guild = require('../../schemas/guilds');
const CommandAudit = require('../../statics/commandAuditUtility');
const defaults = require('../../functions/tools/defaults.json');

/**
 * Gift a user or users in voice channel Chocobo feathers.
 * Requires either a user mention or voice channel and feather count.
 * Retrieves server identifier, sender's identifier, channel members, and mentioned member based on provided options from requesting user
 */


///// TO DO: Add cooldown, but exlcude admin roles from cooldown. Allow admin override of feathers.

module.exports = {
	//cooldown: 43200, // 12 hours
	data: new SlashCommandBuilder()
		.setName('givefeathers')
		.setDescription('Give a friend some Chocobo Feathers!')
		.addStringOption(option => option.setName('category').setDescription('Categorical reason for feather gifting?').setRequired(true).setAutocomplete(true))
		.addUserOption(option => option.setName('user').setDescription('Mention the user you want to give feathers to?').setRequired(false))
		.addChannelOption(option => option.setName('voicechannel').setDescription('Gift to all users currently active in a voice channel?').addChannelTypes(ChannelType.GuildVoice).setRequired(false)),
		async autocomplete(interaction, client) {
			const focusedValue = interaction.options.getFocused();
			const choices = ["Combat", "Crafting", "Chaos", "Dedication", "Gathering", "Generosity", "Leadership"];
			const filtered = choices.filter((choice) => choice.toLowerCase().startsWith(focusedValue.toLowerCase()));
			await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
		},
	async execute(interaction, client) {
		try {

			const regGuild = await Guild.findOne({ guildId: interaction.guild.id });
			if(!regGuild) {
				await interaction.reply({ content: "Sorry, but I cannot run this command because it requires logging. Please have a server administrator `/register`, kweh.", ephemeral: true });
				return;
			}

			const user = interaction.options.getUser("user");
			const voiceChannel = interaction.options.getChannel('voicechannel');
			const guildId = interaction.guild.id;
			const category = interaction.options.getString('category')
				? interaction.options.getString('category').toLowerCase().replace(" ", "")
				: undefined;
			const sender = interaction.guild.members.cache.get(interaction.member.id);
			const featherCount = 1;

			// // Verify command is past cooldown
			const verifyCooldown = await CommandAudit.checkCooldown(guildId, sender, "givefeathers", "12 hours");
			if(!verifyCooldown) {
				const getExpiration = await CommandAudit.retrieveCommandAudit(guildId, "givefeathers", true);
				const cooldownFinished = new Date(getExpiration.createdAt);
				cooldownFinished.setHours(cooldownFinished.getHours() + 12);
				const messagecontent = defaults.DEFAULT_RESPONSES[0].replace("COOLDOWN_LIMIT", "12").replace("TIMESPAN", cooldownFinished);
				await interaction.reply({ content: messagecontent, ephemeral: true });
				return;
			}

			// User isn't gifting anyone feathers
			if(!user && !voiceChannel) {
				console.error("Invalid action. Missing parameters.");
				await interaction.reply({ content: "Sorry, but I don't know who to send these feathers to, kweh.", ephemeral: true });
				return;
			} else if (user && user.id === sender) {
				console.error("Invalid action. Cannot send to self.");
				await interaction.reply({ content: "Sorry, kweh, but you cannot send feathers to yourself.", ephemeral: true });
				return;
			} else if(!category) {
				console.error("Invalid action. Category not set.");
				await interaction.reply({ content: "Sorry, but I don't recognize that category, kweh.", ephemeral: true });
				return;
			} else {
				// Prioritize voice channel of user mention
				if(voiceChannel) {
					// If the channel is not a voice channel, return
					if (!voiceChannel && voiceChannel.type !== 2) { // Formerly, 2 was "GUILD_VOICE"
						await interaction.reply({ content: "That doesn't appear to be a valid voice channel, kweh.", ephemeral: true });
						return;
					}
					// Get all the members in the voice channel
					const membersInVoice = voiceChannel.members;
					if (membersInVoice.size === 0) {
						await interaction.reply({ content: "There are no users in that voice channel, kweh!", ephemeral: true });
						return;
					}
			
					// Extract the usernames
					const userArray = membersInVoice.map(member => member.user.id);
					// Prevent users from gifting themselves
					const filteredUserIds = userArray.filter(entity => entity !== sender.id);
					if(filteredUserIds.length === 0) {
						await interaction.reply({ content: "Sorry, but you cannot send feathers to yourself, kweh.", ephemeral: true });
						return;
					}

					const result = await Feathers.giveFeathersByGuildMember(guildId, filteredUserIds, featherCount, sender, category);
					
					if(result === false) {
						await interaction.reply({ content: `Kweh! Could not gift ${featherCount} feather.`, ephemeral: true });
						return;
					} 
						
					const mentionedUsersArray = filteredUserIds.map(user => `<@${user}>`);
					const CARD_EMBED_MULTIPLE = new EmbedBuilder()
						.setTitle("Chocobo Feathers Giveaway!")
						.setColor(defaults.COLOR)
						.setDescription(`Gifted ${featherCount} of my Feathers, kweh~ :heart:`)
						.setThumbnail(defaults.FEATHER_ICON)
						.addFields(
							{ name: 'Category', value: `${category}` },
							{ name: 'Friends', value: `${mentionedUsersArray.join(',')}` },
						);
						
					return interaction.reply({
						embeds: [CARD_EMBED_MULTIPLE],
					});

				} else { // User mention
					const result = await Feathers.giveFeathersByGuildMember(guildId, [user.id], featherCount, sender, category);
					
					if(result === false) {
						await interaction.reply({ content: `Could not gift ${featherCount} feather.`, ephemeral: true });
						return;
					}

					const CARD_EMBED_SINGLE= new EmbedBuilder()
						.setTitle("Chocobo Feathers Giveaway!")
						.setColor(defaults.COLOR)
						.setDescription(`Gifted ${featherCount} of my ${category} Feathers to ${user}, kweh~ :heart:`)
						.setThumbnail(defaults.FEATHER_ICON);
						
					return interaction.reply({
						embeds: [CARD_EMBED_SINGLE],
					});
				}
			}
		} catch(error) {
			console.error("Give Feathers command failed. ", error);
			await interaction.reply({ content: `KWEH! I can't seem to be able to follow that command right now.`, ephemeral: true });
			return;
		}
	}
};