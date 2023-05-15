const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const XIVAPI = require('@xivapi/js');
const Character = require('../../schemas/character');
const xiv = new XIVAPI({
	private_key: process.env.FFXIV_API_KEY,
	language: 'en'
});
const { ENCRPTY } = process.env;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.addStringOption(option => option.setName('character').setDescription('What is your character Lodestone Id or full name?').setRequired(true))
		.addStringOption(option => option.setName('server').setDescription('What server does your character belong to?').setRequired(true))
		.setDescription('Register with the FFXIV Lodestone.'),
	async execute(interaction) {
		//find the character with their name and server
		const character = interaction.options.getString('character');
		const server = interaction.options.getString('server');
		const author = interaction.guild.members.cache.get(interaction.member.id);
		const lodestoneCharacter = await Character.findOne({ guildId: interaction.guild._id, memberId: author.user.id })
		

		const characterId = /^\d+$/.test(character);

		let res = undefined;
		let finalRes = undefined;
		if (characterId) {
			finalRes = await xiv.character.search(characterId);
		} else {
			res = await xiv.character.search(character, { server: server });
			finalRes = await xiv.character.get(res.Results[0].ID);
		}

		const characterStatus = finalRes.Character.Bio;
		let tokenMatch = false;
		let newCharacter = false;
		console.log(finalRes);
		console.log(lodestoneCharacter && characterStatus.indexOf(lodestoneCharacter.lodestoneToken) > -1);
		// Token matches?
		if (lodestoneCharacter && lodestoneCharacter.lodestoneToken && characterStatus.indexOf(lodestoneCharacter.lodestoneToken) > -1) {
			tokenMatch = true;
		}
		// Another character?
		if(lodestoneCharacter && (lodestoneCharacter.characterName !== finalRes.Character.Name) && (lodestoneCharacter.characterId !== finalRes.Character.ID)) {
			newCharacter = true;
		}

		if (lodestoneCharacter && tokenMatch && !newCharacter) {
			lodestoneCharacter.verified = true;
			lodestoneCharacter.updatedAt = Date().toString();
			await Character.updateOne(lodestoneCharacter).catch(console.error);
			return interaction.reply(`Your character, ${finalRes.Character.Name}, from ${server} has already been verified with Chocobob as of ${lodestoneCharacter.updatedAt}!`);
		} else if (!lodestoneCharacter || !tokenMatch || newCharacter) {
			const randomPlainText = generatePlaintText(5);
			const encryptedText = lodestoneCharacter && lodestoneCharacter.lodestoneToken ? lodestoneCharacter.lodestoneToken : `choco-${encryptString(`${randomPlainText}${author.user.id}`, ENCRPTY)}`;
			if (!lodestoneCharacter || newCharacter) {
				let newCharacter = await new Character({
					_id: new mongoose.Types.ObjectId(),
					guildId: interaction.guild._id,
					characterName: finalRes.Character.Name,
					characterId: finalRes.Character.ID,
					lodestoneToken: encryptedText,
					memberId: interaction.member.id,
					createdAt: Date().toString(),
					verified: false,
				});
				await newCharacter.save().catch(console.error);
			} else {
				lodestoneCharacter.lodestoneToken = encryptedText;
				lodestoneCharacter.characterName = finalRes.Character.Name;
				lodestoneCharacter.characterId = finalRes.Character.ID;
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
	},
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