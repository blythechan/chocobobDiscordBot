const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const defaults = require('../../functions/tools/defaults.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('showlove')
		.setDescription('Show your love to others or yourself')
        .addStringOption(option => option.setName('love').setDescription('What type of love are you giving?').setRequired(true).setAutocomplete(true))
        .addUserOption(option => option.setName('user').setDescription('Select the user to love or leave blank').setRequired(false)),
		async autocomplete(interaction) {
			const focusedValue = interaction.options.getFocused();
			const choices = defaults.SHOW_LOVE_OPS;
			const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
			await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
		},
	async execute(interaction) {
        const user = interaction.options.getUser("user") || interaction.user;			
        const showingLove = interaction.options.getString('love')
            ? interaction.options.getString('love')
            : "bonk";
        const DOUBT_GIF = [
            "https://tenor.com/view/fat-cat-suspect-pusheen-cute-gif-16616242",
            "https://media.tenor.com/ibWRm2mBxCkAAAAM/doubt-yeah.gif",
            "https://media.tenor.com/vC3J9HYGr2sAAAAM/doubt.gif",
            "https://media.tenor.com/qnIjt9riowIAAAAM/doubt-it.gif",
            "https://media.tenor.com/sfq598yu5dIAAAAM/doubtful-ami-dunni-mcclure.gif",
            "https://media.tenor.com/0KEvxoQb5a4AAAAM/doubt-press-x.gif"
        ];

        const SLAP_GIF = [
            "https://tenor.com/view/horny-bonk-gif-22415732",
            "https://tenor.com/view/dungeong-gif-3654754744145897317",
            "https://tenor.com/view/penguin-penguins-penguin-love-penguin-hug-slapping-gif-24271495",
            "https://tenor.com/view/bonk-v%C3%A0o-m%E1%BA%B7t-c%C3%A1i-c%C3%A1m-bonk-anime-bonk-meme-bonk-dog-gif-26069974",
            "https://tenor.com/view/bonk-gif-26414884",
            "https://tenor.com/view/bonk-gif-19410756",
            "https://tenor.com/view/bonkdog-bonk-dog-massive-merrell-twins-gif-23092384",
            "https://tenor.com/view/bonk-shibe-shiba-inu-shiba-great-bonk-shibe-gif-25164188",
            "https://tenor.com/view/bonk-cat-slap-cat-gif-22044106",
            "https://media.tenor.com/ab5hKUJO-kIAAAAM/no-horny-gura.gif",
            "https://media.tenor.com/8oy_9VcmVvEAAAAM/vorzek-vorzneck.gif",
            "https://media.tenor.com/Lg3pd1jqNnMAAAAM/horny-bonk.gif",
            "https://media.tenor.com/4cyL-Pw49p8AAAAM/hornyjail-bonk.gif",
            "https://media.tenor.com/s25Dqz-8ZlAAAAAM/bonk-no-horny.gif",
            "https://media.tenor.com/tS1NvL2ExuoAAAAM/ninomae-inanis-takodachi.gif"
        ];

        const DRINK_GIF = [
            "https://media.tenor.com/4rGualbshuIAAAAj/rascal-water.gif",
            "https://media.tenor.com/ITh6ZVmvhY8AAAAj/puglie-pug-puglie.gif",
            "https://media.tenor.com/UGIRw1A85GQAAAAj/mochi-drink-water.gif",
            "https://media.tenor.com/6wOT1ybuZUMAAAAM/thirsty-drinking.gif",
            "https://media.tenor.com/RjejF2JcHr4AAAAM/water-drink.gif",
            "https://media.tenor.com/2qWrz4ECbuAAAAAM/head-tap.gif"
        ];

        // Generate a random index
        let randomIndex = 0;
        let randomGif = "";
        let message = "";

        switch(showingLove) {
            case defaults.SHOW_LOVE_OPS[0]: // Doubt
                randomIndex = Math.floor(Math.random() * DOUBT_GIF.length);
                randomGif = DOUBT_GIF[randomIndex];
                if(user !== interaction.user) message = `**${user}** doubtful just like your existence :heart:\n${DOUBT_GIF[randomIndex]}`;
                else message = `${DOUBT_GIF[randomIndex]}`;
            break;
            case defaults.SHOW_LOVE_OPS[2]: // Drink Water
                randomIndex = Math.floor(Math.random() * DRINK_GIF.length);
                if(user !== interaction.user) message = `**${user}** drink water. \n${DRINK_GIF[randomIndex]}`;
                else message = `${DRINK_GIF[randomIndex]}`;
            break;
            default: // Bonk
                randomIndex = Math.floor(Math.random() * SLAP_GIF.length);
                if(user !== interaction.user) message = `:clap: **${user}** was just harshly bonked! :clap:\n${SLAP_GIF[randomIndex]}`;
                else message = `${SLAP_GIF[randomIndex]}`;
            break;
        }

		await interaction.reply(message);
	},
};