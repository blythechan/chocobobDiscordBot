const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const puppeteer = require('puppeteer');
const Character = require('../../schemas/character');
const { ENCRPTY } = process.env;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.addStringOption(option => option.setName('characterid').setDescription('What is your player Id in Lodestone?').setRequired(true))
		.addStringOption(option => option.setName('server').setDescription('What server does your character belong to?').setRequired(true))
		.setDescription('Register with the FFXIV Lodestone.'),
	async execute(interaction) {
		try {
			//find the character with their name and server
			const character = interaction.options.getString('characterid');
			const server = interaction.options.getString('server');
			const author = interaction.guild.members.cache.get(interaction.member.id);
			const lodestoneCharacter = await Character.findOne({ guildId: interaction.guild._id, memberId: author.user.id });
			console.log("RESULTS:", lodestoneCharacter);

			// PUPPETEER
			const browser = await puppeteer.launch();
			const page = await browser.newPage();
			await page.goto(`https://na.finalfantasyxiv.com/lodestone/character/17370625/`);
			let pieces = await page.evaluate(() => {
				const characterDataFromLS =
					{
						"name": [],
						"title": [],
						"world": [],
						"profile": [],
						"activeClass": [],
						"classes": [],
						"attributes": [],
						"bio": [],
                        "portrait": []
					}
				;

				let characterIdentity = document.getElementsByClassName("frame__chara__box");
				let characterName = document.getElementsByClassName("frame__chara__name");
				let characterTitle = document.getElementsByClassName("frame__chara__title");
				let characterWorld = document.getElementsByClassName("frame__chara__world");
				let characterProfile = document.getElementsByClassName("character-block__box");
				let characterDetail = document.getElementsByClassName("character__profile__data__detail");
				let characterClass = document.getElementsByClassName("character__level clearfix");
				let characterJobs = document.getElementsByClassName("js__character_toggle");
				let characterBio = document.getElementsByClassName("character__selfintroduction");
				let characterAttributes = document.getElementsByClassName("js__character_toggle");
                let characterDetailImage = document.getElementsByClassName("character__detail__image");
				for(let element of characterName) {
					characterDataFromLS.name.push(element.textContent);
				}

				for(let element of characterTitle) {
					characterDataFromLS.title.push(element.textContent);
				}

				for(let element of characterWorld) {
					characterDataFromLS.world.push(element.textContent);
				}

				for(let element of characterProfile) {
					characterDataFromLS.profile.push(element.textContent);
				}

				for(let element of characterClass) {
					characterDataFromLS.activeClass.push(element.innerHTML);
				}

				for(let element of characterJobs) {
					characterDataFromLS.classes.push(element.textContent);
				}

				for(let element of characterBio) {
					characterDataFromLS.bio.push(element.textContent);
				}

				for(let element of characterAttributes) {
					characterDataFromLS.attributes.push(element.textContent);
				}
                for(let element of characterDetailImage) {
                    characterDataFromLS.portrait.push(element.innerHTML);
                }
				
				return characterDataFromLS;
			});

			await browser.close();
			console.log("TESTING THIS PUPPET:",pieces);
			

			const characterStatus = pieces.bio;
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
				return interaction.reply(`Your character, ${pieces.name}, from ${server} has already been verified with Chocobob as of ${lodestoneCharacter.updatedAt}!`);
			} else if (!lodestoneCharacter || !tokenMatch || newCharacter) {
				const randomPlainText = generatePlaintText(5);
				const encryptedText = lodestoneCharacter && lodestoneCharacter.lodestoneToken ? lodestoneCharacter.lodestoneToken : `choco-${encryptString(`${randomPlainText}${author.user.id}`, ENCRPTY)}`;
				if (!lodestoneCharacter || newCharacter) {
					let newCharacter = await new Character({
						_id: new mongoose.Types.ObjectId(),
						guildId: interaction.guild._id,
						characterName: pieces.name,
						characterId: character,
						lodestoneToken: encryptedText,
						memberId: interaction.member.id,
						createdAt: Date().toString(),
						verified: false,
					});
					await newCharacter.save().catch(console.error);
				} else {
					lodestoneCharacter.lodestoneToken = encryptedText;
					lodestoneCharacter.characterName = pieces.name;
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