const { SlashCommandBuilder, ChannelType } = require('discord.js');
const Feathers = require ('../../statics/feathersUtility');
const Guild = require('../../schemas/guilds');
const CommandAudit = require('../../statics/commandAuditUtility');
const defaults = require('../../functions/tools/defaults.json');
const { customEmbedBuilder } = require('../../events/utility/handleEmbed');
const { checkFeathersLimit } = require('../../events/utility/addRole');

/**
 * Gift a user or users in voice channel Chocobo feathers.
 * Requires either a user mention or voice channel and feather count.
 * Retrieves server identifier, sender's identifier, channel members, and mentioned member based on provided options from requesting user
 */

module.exports = {
	data: new SlashCommandBuilder()
		.setName('givefeathers')
		.setDescription('Give a friend some Chocobo Feathers!')
		.addStringOption(option => option.setName('category').setDescription('Categorical reason for feather gifting?').setRequired(true).setAutocomplete(true))
		.addUserOption(option => option.setName('user').setDescription('Mention the user you want to give feathers to?').setRequired(false))
		.addChannelOption(option => option.setName('voicechannel').setDescription('Gift to all users currently active in a voice channel?').addChannelTypes(ChannelType.GuildVoice).setRequired(false)),
		async autocomplete(interaction) {
			const focusedValue = interaction.options.getFocused();
			const choices = defaults.FEATHER_CATS;
			const filtered = choices.filter((choice) => choice.cat.startsWith(focusedValue));
			await interaction.respond(filtered.map((choice) => ({ name: choice.cat, value: choice.cat })));
		},
	async execute(interaction, client) {
		try {

			const regGuild = await Guild.findOne({ guildId: interaction.guild.id });
			if(!regGuild) {
				const EMBED = customEmbedBuilder(
					undefined,
					defaults.CHOCO_SAD_ICON,
					"Sorry, but I cannot run this command because it requires logging. Please have a server administrator `/server register`, kweh.",
					undefined
				);
				return interaction.reply({
					embeds: [EMBED],
					ephemeral: true
				});
			}

			const user = interaction.options.getUser("user");
			const voiceChannel = interaction.options.getChannel('voicechannel');
			const guildId = interaction.guild.id;
			const category = interaction.options.getString('category')
				? interaction.options.getString('category').replace(" ", "")
				: undefined;
			const sender = interaction.guild.members.cache.get(interaction.member.id);
			const featherCount = 1;
			
			let author = interaction.guild.members.cache.get(interaction.member.id);
			const userIsAdmin = author.permissions.has('ADMINISTRATOR');

			// // Verify command is past cooldown
			const verifyCooldown = await CommandAudit.checkCooldown(guildId, sender, "givefeathers", "12 hours");
			if(!verifyCooldown) {
				if(!userIsAdmin) {
					const getExpiration = await CommandAudit.retrieveCommandAudit(guildId, "givefeathers", true);
					const cooldownFinished = new Date(getExpiration.createdAt);
					cooldownFinished.setHours(cooldownFinished.getHours() + 12);
					const messagecontent = defaults.DEFAULT_RESPONSES[0].replace("COOLDOWN_LIMIT", "12").replace("TIMESPAN", cooldownFinished);
					await interaction.reply({ content: messagecontent, ephemeral: true });
					return;
				}
			}

			// User isn't gifting anyone feathers
			if(!user && !voiceChannel) {
				console.error("Invalid action. Missing parameters.");
				const EMBED = customEmbedBuilder(
					undefined,
					defaults.CHOCO_SAD_ICON,
					"Sorry, but I don't know who to send these feathers to, kweh.",
					undefined
				);
				return interaction.reply({
					embeds: [EMBED],
					ephemeral: true
				});
			} else if (user && user.id === sender) {
				console.error("Invalid action. Cannot send to self.");
				const EMBED = customEmbedBuilder(
					undefined,
					defaults.CHOCO_SAD_ICON,
					"Sorry, kweh, but you cannot send feathers to yourself.",
					undefined
				);
				return interaction.reply({
					embeds: [EMBED],
					ephemeral: true
				});
			} else if(!category) {
				console.error("Invalid action. Category not set.");
				const EMBED = customEmbedBuilder(
					undefined,
					defaults.CHOCO_SAD_ICON,
					"Sorry, but I don't recognize that category, kweh.",
					undefined
				);
				return interaction.reply({
					embeds: [EMBED],
					ephemeral: true
				});
			} else {
				// Prioritize voice channel of user mention
				if(voiceChannel) {
					// If the channel is not a voice channel, return
					if (!voiceChannel && voiceChannel.type !== 2) { // Formerly, 2 was "GUILD_VOICE"
						const EMBED = customEmbedBuilder(
							undefined,
							defaults.CHOCO_SAD_ICON,
							"That doesn't appear to be a valid voice channel, kweh.",
							undefined
						);
						return interaction.reply({
							embeds: [EMBED],
							ephemeral: true
						});
					}
					// Get all the members in the voice channel
					const membersInVoice = voiceChannel.members;
					if (membersInVoice.size === 0) {
						const EMBED = customEmbedBuilder(
							undefined,
							defaults.CHOCO_SAD_ICON,
							"There are no users in that voice channel, kweh!"
						);
						return interaction.reply({
							embeds: [EMBED],
							ephemeral: true
						});
					}
			
					// Extract the usernames
					const userArray = membersInVoice.map(member => member.user.id);
					// Prevent users from gifting themselves by filtering this out, if this is empty 
					// then they were attempting to give themselves feathers
					const filteredUserIds = userArray.filter(entity => entity !== sender.id);
					if(filteredUserIds.length === 0) {
						const EMBED = customEmbedBuilder(
							undefined,
							defaults.CHOCO_SAD_ICON,
							"Sorry, but you cannot send feathers to yourself, kweh."
						);
						return interaction.reply({
							embeds: [EMBED],
							ephemeral: true
						});
					}

					const result = await Feathers.giveFeathersByGuildMember(guildId, filteredUserIds, featherCount, sender, category);
					
					// FAILED
					if(result === false) {
						const EMBED = customEmbedBuilder(
							undefined,
							defaults.CHOCO_SAD_ICON,
							`Kweh! Could not gift ${featherCount} feather.`,
							undefined
						);
						return interaction.reply({
							embeds: [EMBED],
							ephemeral: true
						});
					} 
					
					// SUCCEESS
					const mentionedUsersArray = filteredUserIds.map(user => `<@${user}>`);
					// Begin auto-role
					filteredUserIds.map(async (user) => {
						const userFeathers = await Feathers.findFeathersByGuildMember(guildId, user.id);
						// ASSIGN ROLE
						const ASSIGN_ROLE = userFeathers && userFeathers !== null && checkFeathersLimit(regGuild, userFeathers, category);
						// Retrieve all user data
						const guildUser = interaction.guild.members.cache.get(user.id);
						if(ASSIGN_ROLE) {
							try {
								let role = interaction.guild.roles.cache.find(role => role.name === ASSIGN_ROLE);
								if (!role) {
									role = await interaction.guild.roles.create({
										name: ASSIGN_ROLE,
										color: 'Grey', // Change this to your preferred color
										permissions: [], // Add permissions if needed
										reason: 'Role created automatically by Chocobob'
									});
								} 
								// verify user does not already have this role
								if(!guildUser.roles.cache.some(r => r.name === ASSIGN_ROLE)) { 
									const randomTrophy = [
										"https://res.cloudinary.com/mediocre/image/upload/v1534735796/ofyr2erfhympnucdovnc.png",
										"https://pbs.twimg.com/profile_images/958522091283791872/zqS5vca_.jpg",
										"https://media.cmsmax.com/ticydm4kh3ezejhlvv1wi/thumbs/dtrf19ab-cvideo-1.jpg",
										"https://image.freepik.com/free-vector/classic-video-game-trophy_24911-47180.jpg"
									];
		
									// Adding the role to the user
									const member =await interaction.guild.members.fetch(user.id);
									await member.roles.add(role);
									await CommandAudit.createAudit(guildId, sender, "givefeathers", `Assigned ${role.name} [${role.id}] to user ${user.id}`);
									const EMBED = customEmbedBuilder(
										"Participation is Cool!",
										defaults.CHOCO_HAPPY_ICON,
										undefined,
										[
											{ name: " ", value: `You recieved an achievement in ${interaction.guild.name}, and have been assigned "${ASSIGN_ROLE}." Congratulations!`}
										],
										undefined,
										undefined,
										randomTrophy[Math.floor(Math.random() * randomTrophy.length)]
									);
									user.send({
										embeds: [EMBED]
									});
								}
							} catch (error) {
								console.error('Auto role for feather category failed: ', error);
								const EMBED = customEmbedBuilder(
									undefined,
									defaults.CHOCO_SAD_ICON,
									`KWEH! Something went wrong when trying to auto-assign a role.`
								);
								return interaction.reply({
									embeds: [EMBED]
								});
							}
						}
					});
					const EMBED = customEmbedBuilder(
						"Chocobo Feathers Giveaway!",
						defaults.FEATHER_ICON,
						`Gifted ${featherCount} of my Feathers, kweh~ :heart:`,
						[
							{ name: 'Category', value: `${category}` },
							{ name: 'Friends', value: `${mentionedUsersArray.join(',')}` }
						]
					);
					return interaction.reply({
						embeds: [EMBED],
						ephemeral: true
					});

				} else { // USER MENTION
					const result = await Feathers.giveFeathersByGuildMember(guildId, [user.id], featherCount, sender, category);
					if(result === false) {
						const EMBED = customEmbedBuilder(
							undefined,
							defaults.CHOCO_SAD_ICON,
							`Could not gift ${featherCount} feather.`,
							undefined
						);
						return interaction.reply({
							embeds: [EMBED],
							ephemeral: true
						});
					}

					const userFeathers = await Feathers.findFeathersByGuildMember(guildId, user.id);

					// ASSIGN ROLE
					const ASSIGN_ROLE = userFeathers && userFeathers !== null && checkFeathersLimit(regGuild, userFeathers, category);
					// Retrieve all user data
					const guildUser = interaction.guild.members.cache.get(user.id);
					if(ASSIGN_ROLE) {
						try {
							let role = interaction.guild.roles.cache.find(role => role.name === ASSIGN_ROLE);
							if (!role) {
								role = await interaction.guild.roles.create({
									name: ASSIGN_ROLE,
									color: 'Grey', // Change this to your preferred color
									permissions: [], // Add permissions if needed
									reason: 'Role created automatically by Chocobob'
								});
							} 
							// verify user does not already have this role
							if(!guildUser.roles.cache.some(r => r.name === ASSIGN_ROLE)) { 
								const randomTrophy = [
									"https://res.cloudinary.com/mediocre/image/upload/v1534735796/ofyr2erfhympnucdovnc.png",
									"https://pbs.twimg.com/profile_images/958522091283791872/zqS5vca_.jpg",
									"https://media.cmsmax.com/ticydm4kh3ezejhlvv1wi/thumbs/dtrf19ab-cvideo-1.jpg",
									"https://image.freepik.com/free-vector/classic-video-game-trophy_24911-47180.jpg"
								];
	
								// Adding the role to the user
								const member = await interaction.guild.members.fetch(user.id);
								await member.roles.add(role);
								CommandAudit.createAudit(guildId, sender, "givefeathers", `Assigned ${role.name} [${role.id}] to user ${user.id}`);
								const EMBED = customEmbedBuilder(
									"Participation is Cool!",
									defaults.CHOCO_HAPPY_ICON,
									undefined,
									[
										{ name: " ", value: `You recieved an achievement in ${interaction.guild.name}, and have been assigned "${ASSIGN_ROLE}." Congratulations!`}
									],
									undefined,
									undefined,
									randomTrophy[Math.floor(Math.random() * randomTrophy.length)]
								);
								await user.send({
									embeds: [EMBED]
								});
							}
						} catch (error) {
							console.error('Auto role for feather category failed: ', error);
							const EMBED = customEmbedBuilder(
								undefined,
								defaults.CHOCO_SAD_ICON,
								`KWEH! Something went wrong when trying to auto-assign a role.`
							);
							return interaction.reply({
								embeds: [EMBED]
							});
						}
					}

					const EMBED = customEmbedBuilder(
						"Chocobo Feathers Giveaway!",
						defaults.FEATHER_ICON,
						`Gifted ${featherCount} of my ${category} Feathers to ${user}, kweh~ :heart:`
					);
					return interaction.reply({
						embeds: [EMBED]
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