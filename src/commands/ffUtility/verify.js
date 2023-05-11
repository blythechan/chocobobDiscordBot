const { SlashCommandBuilder } = require('discord.js');
const XIVAPI = require('@xivapi/js');
const xiv = new XIVAPI({
    private_key: process.env.FFXIV_API_KEY,
    language: 'en'
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.addStringOption(option => option.setName('character').setDescription('What is your character Lodestone Id or full name?').setRequired(true))
		.addStringOption(option => option.setName('server').setDescription('What server does your character belong to?').setRequired(true))
		.setDescription('Register with the Chocobot Lodestone.'),
	async execute(interaction) {
		//find the character with their name and server
		const character = interaction.options.getString('character');
		const server = interaction.options.getString('server');

		const characterId = /^\d+$/.test(character);

		console.log(characterId)

		let res = undefined;
		let finalRes = undefined;
		if(characterId) {
			finalRes = await xiv.character.search(characterId);
		} else {
			res = await xiv.character.search(character, { server: server });
			finalRes = await xiv.character.get(res.Results[0].ID);
		}
		console.log(finalRes);
	  
		//return whether or not the character's lodestone bio matches our token
		//return char.Bio === 'example_token'
		const characterStatus = finalRes.Bio;
		if(characterStatus === 'example_token')
			await interaction.reply(`Your bio matches. Verified. Yay!`);
		else {
			await interaction.reply(`Your does not bio match. Not Verified. Yay!`);
			// interaction.user.send({ content: `DO NOT DO THIS. THIS IS A TEST.\n
			// I'm sending you a verification token code for your character's Lodestone because your request on a server: ${interaction.member.guild.name}. Do not reply to this message as I will have returned to my Chocobo Stable once you finish reading this.\n\n
			// Add the following token to your character's Lodestone bio: ${'example_token'}.` })
            //     .then(sentMessage => interaction.reply(`THIS IS A TEST. I just sent you a DM about how to get your character verified, kweh!\n
			// 	The purpose of verifying a FFXIV character differs per FC and per server. I am not responsible for whatever purpose or reason the server deems necessary when verification is involved.`))
            //     .catch(error => {
            //         console.error(error.message);
            //         interaction.reply(` THIS IS A TEST.I couldn't send you a DM about how to get your character verified... well, the Kupo are rather buys these days.`)
            //     });
		}
	},
};