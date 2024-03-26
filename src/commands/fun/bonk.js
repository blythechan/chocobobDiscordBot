const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const defaults = require('../../functions/tools/defaults.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bonk')
		.setDescription('Bonk someone with your strong hand.')
        .addUserOption(option => option.setName('user').setDescription('Select the user to bonk or leave blank to bonk yourself').setRequired(false)),
	async execute(interaction) {
        const user = interaction.options.getUser("user") || interaction.user;
        const SLAP_GIF = [
            "https://tenor.com/view/alarm-clock-gif-13113283966983760126",
            "https://tenor.com/view/dungeong-gif-3654754744145897317",
            "https://tenor.com/view/penguin-penguins-penguin-love-penguin-hug-slapping-gif-24271495",
            "https://tenor.com/view/bonk-v%C3%A0o-m%E1%BA%B7t-c%C3%A1i-c%C3%A1m-bonk-anime-bonk-meme-bonk-dog-gif-26069974",
            "https://tenor.com/view/bonk-gif-26414884",
            "https://tenor.com/view/bonk-gif-19410756",
            "https://tenor.com/view/bonkdog-bonk-dog-massive-merrell-twins-gif-23092384"
        ];

        // Generate a random index
        const randomIndex = Math.floor(Math.random() * SLAP_GIF.length);
        const randomGif = SLAP_GIF[randomIndex];

		await interaction.reply(`:clap: **${user}** was just harshly bonked! :clap:\n${randomGif}`);
	},
};