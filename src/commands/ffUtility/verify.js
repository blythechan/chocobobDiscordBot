const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const axios = require('axios');
const cheerio = require("cheerio");
const Character = require('../../schemas/character');
const Guild = require('../../schemas/guilds');
const FFXIVServers = require('../../schemas/ffxivServers');
const defaults = require('../../functions/tools/defaults.json');
const { ENCRPTY } = process.env;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.addStringOption(option => option.setName('characterid').setDescription('What is your player Id in Lodestone?'))
		.addStringOption(option => option.setName('charactername').setDescription('What is the full name of your character?'))
		.addStringOption(option => option.setName('datacenter').setDescription('What is the data center?').setAutocomplete(true))
		.addStringOption(option => option.setName('homeworld').setDescription('What is the homeworld?').setAutocomplete(true))
		.setDescription('Register with the FFXIV Lodestone via id OR name, data center, and home world.'),
	async autocomplete(interaction, client) {
		const focusedOption = interaction.options.getFocused(true);
		let choices = [];
		if (focusedOption.name === "datacenter") {
			const homeworldOption = interaction.options.getString('homeworld');
			if (!homeworldOption) choices = await FFXIVServers.distinct("data_center");
			else choices = await FFXIVServers.findOne({ home_worlds: { $in: [homeworldOption] } }, { data_center: 1 });
		}

		if (focusedOption.name === "homeworld") {
			const datacenterOption = interaction.options.getString('datacenter');
			if (!datacenterOption) choices = await FFXIVServers.distinct("home_worlds");
			else choices = await FFXIVServers.findOne({ data_center: datacenterOption }, { home_worlds: 1 });
		}

		const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
		await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
	},
	async execute(interaction) {
		try {
            await interaction.deferReply();

			//find the character with their name and server
			const character = interaction.options.getString('characterid');
			const characterFullName = interaction.options.getString('charactername');
			const homeWorld = interaction.options.getString('homeworld');
			if (!character || !(characterFullName && homeWorld)) {
				const CARD_EMBED = new EmbedBuilder()
					.setColor(defaults.COLOR)
					.setDescription(`Kweh! You haven't given me enough information to go find that character. Character Id or character name and home world are required.`);
				return await interaction.editReply({ embeds: [CARD_EMBED] });
			}
			const author = interaction.guild.members.cache.get(interaction.member.id);
			const lodestoneCharacter = await Character.findOne({ guildId: interaction.guild._id, memberId: author.user.id });

			const guildProfile = await Guild.findOne({ guildId: interaction.guild._id });
			let autoAssignRole = false;
			if (guildProfile) {
				autoAssignRole = guildProfile.allowFCAutoRoleOnRegister;
			}

			// Retrieve character
			/** CHEERIO VARS */
			const cheerioResults = {
				bio: [],
				world: [],
				name: [],
				fc: []
			}
			/** CHEERIO VARS */

			if (character) {
				await axios//#character > div.character__content.selected > div.character__selfintroduction
					.get(`https://na.finalfantasyxiv.com/lodestone/character/${character}/`)
					.then(function (response) {
						const $ = cheerio.load(response.data);
						$('#character > div.character__content.selected > div.character__selfintroduction').each((idx, element) => {
							const bio = $(element).text();
							cheerioResults.bio.push(bio);
						});

						$('#character > div.frame__chara.js__toggle_wrapper > a > div.frame__chara__box > p.frame__chara__name').each((idx, element) => {
							const fullName = $(element).text();
							cheerioResults.name.push(fullName);
						});

						$('#character > div.frame__chara.js__toggle_wrapper > a > div.frame__chara__box > p.frame__chara__world').each((idx, element) => {
							const world = $(element).text();
							cheerioResults.world.push(world);
						});

						$('#character > div.character__content.selected > div.character__profile.clearfix > div.character__profile__data > div:nth-child(1) > div > div:nth-child(5) > div.character-block__box > div > h4 > a').each((idx, element) => {
							const href = $('a').attr('href');
							const urlParameter = href.split('/').pop();
							cheerioResults.fc.push(urlParameter);
						});
					})
					.catch(error => {
						console.error(`Error encountered during verify:`, error);
					});
				// if(cheerioResults.bio.length  === 0) {
				// 	return await interaction.editReply({
				// 		content: `It seems your Lodestone profile is empty, kweh. I couldn't verify your character.`,
				// 		ephemeral: true
				// 	});
				// }
			} else if (characterName && homeWorld) {
				let href = "";
				await axios
					.get(`https://na.finalfantasyxiv.com/lodestone/character/?q=${characterName.replace(" ", "+")}&worldname=${homeWorld}&classjob=&race_tribe=&blog_lang=ja&blog_lang=en&blog_lang=de&blog_lang=fr&order=`)
					.then(function (response) {
						const $ = cheerio.load(response.data);
						$('#character > div.character__content.selected > div.character__profile.clearfix > div.character__profile__data > div:nth-child(1) > div > div:nth-child(5) > div.character-block__box > div > h4 > a').each((idx, element) => {
							href = $('a').attr('href');
						});
					})
					.catch(error => {
						console.error(`Error encountered during verify:`, error);
					});
				await axios
					.get(href)
					.then(function (response) {
						const $ = cheerio.load(response.data);
						$('#character > div.character__content.selected > div.character__selfintroduction').each((idx, element) => {
							const bio = $(element).text();
							cheerioResults.bio.push(bio);
						});

						$('#character > div.frame__chara.js__toggle_wrapper > a > div.frame__chara__box > p.frame__chara__name').each((idx, element) => {
							const fullName = $(element).text();
							cheerioResults.name.push(fullName);
						});

						$('#character > div.frame__chara.js__toggle_wrapper > a > div.frame__chara__box > p.frame__chara__world').each((idx, element) => {
							const world = $(element).text();
							cheerioResults.world.push(world);
						});

						$('#character > div.character__content.selected > div.character__profile.clearfix > div.character__profile__data > div:nth-child(1) > div > div:nth-child(5) > div.character-block__box > div > h4 > a').each((idx, element) => {
							const href = $('a').attr('href');
							const urlParameter = href.split('/').pop();
							cheerioResults.fc.push(urlParameter);
						});
					})
					.catch(error => {
						console.error(`Error encountered during verify:`, error);
					});
			}

			const characterStatus = cheerioResults.bio[0];
			const characterAddress = cheerioResults.world[0];
			const characterName = cheerioResults.name[0];
			const freeCompanyId = cheerioResults.fc[0];
			let tokenMatch = false;
			let newCharacter = false;
			// Token matches?
			if (lodestoneCharacter && lodestoneCharacter.lodestoneToken && characterStatus.includes(lodestoneCharacter.lodestoneToken)) {
				tokenMatch = true;
			}
			// Another character?
			if (lodestoneCharacter && (lodestoneCharacter.characterName !== cheerioResults.name[0]) && (lodestoneCharacter.characterId !== character)) {
				newCharacter = true;
			}

			if (lodestoneCharacter && tokenMatch && !newCharacter) {
				lodestoneCharacter.verified = true;
				lodestoneCharacter.updatedAt = Date().toString();
				await Character.updateOne(lodestoneCharacter).catch(console.error);

				// Give this user a FC role
				if (autoAssignRole && guildProfile.fcIds.includes(freeCompanyId) && guildProfile.autoFCRoleOnRegister[0]) {
					const ASSIGN_ROLE = guildProfile.autoFCRoleOnRegister[0];
					let role = interaction.guild.roles.cache.find(role => role.name === ASSIGN_ROLE);
					if (!role) {
						role = await interaction.guild.roles.create({
							name: ASSIGN_ROLE,
							color: 'Pink',
							permissions: [],
							reason: 'Role created automatically by Chocobob'
						});
					}

					// Verify if user has this role, if not then assign
					const guildUser = await interaction.guild.members.cache.get(author.id);
					if (!guildUser.roles.cache.some(r => r.name === ASSIGN_ROLE)) {
						// Adding the role to the user
						await guildUser.roles.add(role);
						roleAdded.push(ASSIGN_ROLE);
					}
				} else if (autoAssignRole && !guildProfile.fcIds.includes(freeCompanyId) && guildProfile.autoFCRoleOnRegister[1]) {
					const ASSIGN_ROLE = guildProfile.autoFCRoleOnRegister[1];
					let role = interaction.guild.roles.cache.find(role => role.name === ASSIGN_ROLE);
					if (!role) {
						role = await interaction.guild.roles.create({
							name: ASSIGN_ROLE,
							color: 'Pink',
							permissions: [],
							reason: 'Role created automatically by Chocobob'
						});
					}

					// Verify if user has this role, if not then assign
					const guildUser = await interaction.guild.members.cache.get(author.id);
					if (!guildUser.roles.cache.some(r => r.name === ASSIGN_ROLE)) {
						// Adding the role to the user
						await guildUser.roles.add(role);
						roleAdded.push(ASSIGN_ROLE);
					}

					return interaction.editReply(`Your character, ${characterName}, from ${characterAddress} has been verified with Chocobob as of ${lodestoneCharacter.createdAt}!`);
				} else if (!lodestoneCharacter || !tokenMatch || newCharacter) {
					const randomPlainText = generatePlaintText(5);
					const encryptedText = lodestoneCharacter && lodestoneCharacter.lodestoneToken ? lodestoneCharacter.lodestoneToken : `choco-${encryptString(`${randomPlainText}${author.user.id}`, ENCRPTY)}`;
					if (!lodestoneCharacter || newCharacter) {
						let newCharacter = await new Character({
							_id: new mongoose.Types.ObjectId(),
							guildId: interaction.guild._id,
							characterName: characterName,
							characterId: character,
							freeCompanyId: freeCompanyId,
							lodestoneToken: encryptedText,
							memberId: interaction.member.id,
							createdAt: Date().toString(),
							verified: false,
						});
						await newCharacter.save().catch(console.error);
					} else {
						lodestoneCharacter.lodestoneToken = encryptedText;
						lodestoneCharacter.characterName = characterName;
						lodestoneCharacter.characterId = character;
						lodestoneCharacter.updatedAt = Date().toString();
						await Character.updateOne(lodestoneCharacter).catch(console.error);
					}
					interaction.user.send({
						content: `I'm sending you a verification token code for your character's Lodestone because your request on a server: ${interaction.member.guild.name}. Do not reply to this message as I will have returned to my Chocobo Stable once you finish reading this.\n\nAdd the following token to your character's Lodestone bio:\n\n**${encryptedText}**\n\nChanges to the Lodestone can take a while to update and be recognized by Chocobob. The time it takes for Lodestone to update is out of Chocobob's control. If you want to check when the last update of Lodestone was, try running the Lodestone Updates command.`,
						ephemeral: true
					})
						.then(sentMessage => interaction.editReply({
							content: `I just sent you a DM about how to get your character verified, kweh!\nThe purpose of verifying a FFXIV character differs per FC and per server. I am not responsible for whatever purpose or reason the server deems necessary when Lodestone verification is involved.`,
							ephemeral: true
						}))
						.catch(error => {
							console.error(error.message);
							interaction.editReply({
								content: `I couldn't send you a DM about how to get your character verified... well, the Kupo are rather buys these days.`,
								ephemeral: true
							})
						});
				}
			}
		} catch (error) {
			console.error(`Encountered error during verify. `, error);
			return await interaction.editReply({
				content: `I couldn't send you a DM about how to get your character verified... well, the Kupo are rather buys these days.`,
				ephemeral: true
			});
		}
	}
};

function encryptString(plainText, secretKey) {
	const secret = CryptoJS.enc.Utf8.parse(secretKey);
	let iv = CryptoJS.lib.WordArray.create(secret.words.slice(0, 4));
	return CryptoJS.AES.encrypt(plainText, secret, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	}).toString();
}

function generatePlaintText(length) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}