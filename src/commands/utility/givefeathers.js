const { SlashCommandBuilder } = require('discord.js');
const Feathers = require ('../../schemas/feathers');
require("dotenv").config();

/**
 * Gift a user or users in voice channel Chocobo feathers.
 * Requires either a user mention or voice channel and feather count.
 * Retrieves server identifier, sender's identifier, channel members, and mentioned member based on provided options from requesting user
 */


///// TO DO: Add cooldown, but exlcude admin roles from cooldown.

module.exports = {
	data: new SlashCommandBuilder()
		.setName('givefeathers')
		.setDescription('Give a friend some Chocobo Feathers!')
		.addStringOption(option => option.setName('category').setDescription('Categorical reason for feather gifting?').setRequired(false))
		.addUserOption(option => option.setName('user').setDescription('Mention the user you want to give feathers to?').setRequired(false))
		.addChannelOption(option => option.setName('voiceChannel').setDescription('Gift to all users currently active in a voice channel?').setRequired(false).addChannelTypes(ChannelType.GuildVoice))
		.addNumberOption(option => option.setName('howMany').setDescription('How many feathers?').setRequired(true)),
	async execute(interaction, client) {
		const user = interaction.options.getUser("user");
		const channel = interaction.options.getChannel('voiceChannel');
		const guildId = interaction.guild.id;
		const category = interaction.options.getString("category") || "";
		const sender = interaction.guild.members.cache.get(interaction.member.id);
		const featherCount = interaction.options.getNumber("howMany") || 1;

		// User isn't gifting anyone feathers
		if((!user && !channel) || (user === null || channel === null) || (user.id === sender.id)) {
			console.error("Invalid action. Missing parameters");
        	await interaction.reply("Sorry, but I don't know who to send these feathers to... try again?");
		} else {
			// Prioritize voice channel of user mention
			if(channel && channel !== null) {
				// Retrieve voice channel and verify it is indeed a voice channel
				const voiceChannel = guild.channels.cache.get(channel);
				// If the channel is not a voice channel, return
				if (!voiceChannel || voiceChannel.type !== 'GUILD_VOICE') {
					await interaction.reply(`That doesn't appear to be a valid voice channel...`);
					return;
				}
				// Get all the members in the voice channel
				const membersInVoice = voiceChannel.members;
				if (membersInVoice.size === 0) {
					await interaction.reply(`There are no users in that voice channel, kweh!`);
					return;
				}
		
				// Extract the usernames
				const userArray = membersInVoice.map(member => member.user);
				// Prevent users from gifting themselves
				const filteredUsernames = userArray.filter(entity => entity.id !== sender.id);
				if(filteredUsernames.length === 0) {
					await interaction.reply("Sorry, but I don't know who to send these feathers to... try again?");
					return;
				}

				const result = await Feathers.giveFeathersByGuildMember({ guildId: guildId, member: filteredUsernames, featherCount: featherCount, sender: sender, category: category });
				result === true 
					? await interaction.reply(`Gifted ${featherCount} of my feathers kweh~ :heart:`)
					: await interaction.reply(`Could not gift ${featherCount} feathers.`);
				return;
			} else { // User mention
				const result = await Feathers.giveFeathersByGuildMember({ guildId: guildId, member: [user], featherCount: featherCount, sender: sender, category: category });
				result === true 
					? await interaction.reply(`Gifted ${featherCount} of my feathers kweh~ :heart:`)
					: await interaction.reply(`Could not gift ${featherCount} feathers.`);
				return;
			}
		}
	}
};