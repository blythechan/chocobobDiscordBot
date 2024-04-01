const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const axios = require('axios');
const cheerio = require("cheerio");
const Character = require('../../schemas/character');
const { ENCRPTY } = process.env;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.addStringOption(option => option.setName('characterid').setDescription('What is your player Id in Lodestone?').setRequired(true))
		.setDescription('Register with the FFXIV Lodestone.'),
	async execute(interaction) {
		try {
			//find the character with their name and server
			const character = interaction.options.getString('characterid');
			const author = interaction.guild.members.cache.get(interaction.member.id);
			const lodestoneCharacter = await Character.findOne({ guildId: interaction.guild._id, memberId: author.user.id });

			// Retrieve character
			
            /** CHEERIO VARS */
			const cheerioResults = {
				bio: [],
				world: [],
				name: []
			}
            /** CHEERIO VARS */
			
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
				})
				.catch(error => {
					console.error(`Error encountered during verify:`, error);
				});
			if(cheerioResults.bio.length  === 0) {
				return await interaction.reply({
					content: `I couldn't send you a DM about how to get your character verified... well, the Kupo are rather buys these days.`,
					ephemeral: true
				});
			}

			const characterStatus = cheerioResults.bio[0];
			const characterWorld = cheerioResults.world[0];
			const characterName = cheerioResults.name[0];
			let tokenMatch = false;
			let newCharacter = false;
			// Token matches?
			if (lodestoneCharacter && lodestoneCharacter.lodestoneToken && characterStatus.includes(lodestoneCharacter.lodestoneToken)) {
				tokenMatch = true;
			}
			// Another character?
			if(lodestoneCharacter && (lodestoneCharacter.characterName !== pieces.name) && (lodestoneCharacter.characterId !== character)) {
				newCharacter = true;
			}

			if (lodestoneCharacter && tokenMatch && !newCharacter) {
				lodestoneCharacter.verified = true;
				lodestoneCharacter.updatedAt = Date().toString();
				await Character.updateOne(lodestoneCharacter).catch(console.error);
				return interaction.reply(`Your character, ${characterName}, from ${characterWorld} has already been verified with Chocobob as of ${lodestoneCharacter.createdAt}!`);
			} else if (!lodestoneCharacter || !tokenMatch || newCharacter) {
				const randomPlainText = generatePlaintText(5);
				const encryptedText = lodestoneCharacter && lodestoneCharacter.lodestoneToken ? lodestoneCharacter.lodestoneToken : `choco-${encryptString(`${randomPlainText}${author.user.id}`, ENCRPTY)}`;
				if (!lodestoneCharacter || newCharacter) {
					let newCharacter = await new Character({
						_id: new mongoose.Types.ObjectId(),
						guildId: interaction.guild._id,
						characterName: characterName,
						characterId: character,
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
					.then(sentMessage => interaction.reply({
						content: `I just sent you a DM about how to get your character verified, kweh!\nThe purpose of verifying a FFXIV character differs per FC and per server. I am not responsible for whatever purpose or reason the server deems necessary when Lodestone verification is involved.`,
						ephemeral: true
					}))
					.catch(error => {
						console.error(error.message);
						interaction.reply({
							content: `I couldn't send you a DM about how to get your character verified... well, the Kupo are rather buys these days.`,
							ephemeral: true
						})
					});
			}
		} catch (error) {
			console.error(`Encountered error during verify. `, error);
			return await interaction.reply({
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