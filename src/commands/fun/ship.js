const { SlashCommandBuilder, roleMention, userMention, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');

const applyText = (canvas, text) => {
	const context = canvas.getContext('2d');
	let fontSize = 30;

	do {
		context.font = `${fontSize -= 10}px Arial`;
	} while (context.measureText(text).width > canvas.width - 500);

	return context.font;
};

const colorThreshold = (matchRate) => {
        if(matchRate < 10) {
                return '#ff0004';
        } else if(matchRate < 20) {
                return '#e8060a';
        } else if(matchRate < 30) {
                return '#c9080b';
        } else if(matchRate < 40) {
                return '#af0a0d';
        } else if(matchRate < 50) {
                return '#990a0d';
        } else if(matchRate < 60) {
                return '#870c0e';
        } else if(matchRate < 70) {
                return '#6b0a0c';
        } else if(matchRate < 80) {
                return '#490809';
        } else if(matchRate < 90) {
                return '#300607';
        } else if(matchRate === 100) {
                return 'black';
        } 
}

const sayThis = (matchRate) => {
        if(matchRate > 75) return "I ship it!";
        if(matchRate < 35) return "That ship has long since sailed.";
        return "";
}

const botId             = "1070431418750087342";
const botOwnerId        = "139920603711930368";
const images            = [
        'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.QoczFHiwSyQ9__9KPWXLwQHaEK%26pid%3DApi&f=1&ipt=a80c0516791905a0cad6ddfaaaa3845c5bbfc58b7f1692c28f54f6591bb47de2&ipo=images'
]

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ship')
		.setDescription('Want to know how compatible users are in your server? Command will ping users involved.')
                .addUserOption(option => option.setName('shipa').setDescription('Mention the first user').setRequired(true))
                .addUserOption(option => option.setName('shipb').setDescription('Mention the second user').setRequired(true)),
	async execute(interaction) {
                try {
                        const shipA = interaction.options.getUser('shipa');
                        const shipB = interaction.options.getUser('shipb');
                        let matchRate = 0;
                        if((shipB.id === botId || shipA.id === botId)) {
                                if(shipB.id === botOwnerId || shipA.id === botOwnerId) {
                                        matchRate = 100;
                                } else {
                                        matchRate = 0;
                                }
                        } else {
                                matchRate = Math.round(Math.random() * 99) + 1;
                        }

                        const canvas = Canvas.createCanvas(880, 350);
		        const context = canvas.getContext('2d');

                        const background = await Canvas.loadImage(images[0]);

                        context.drawImage(background, 0, 0, canvas.width, canvas.height);

                        const matchRateImage = await Canvas.loadImage('https://img.icons8.com/?size=512&id=23128&format=png');
                        context.drawImage(matchRateImage, 200, 50, 150, 150);

                        // Draw text
                        context.font = applyText(canvas, `${shipB.username}`);
                        context.fillStyle = '#020200';
                        context.fillText(`${shipA.username}`, 70, 200);

                        context.font = '30px Arial';
                        context.fillStyle = colorThreshold(matchRate);
                        const len = matchRate < 100
                                ? 250
                                : 240;
                        context.fillText(`${matchRate}%`, len, 140);
                        
                        context.font = applyText(canvas, `${shipB.username}`);
                        context.fillStyle = '#020200';
                        context.fillText(`${shipB.username}`, 350, 200);

                        // Make a circle
                        context.beginPath();
                        context.arc(130, 115, 65, 0, Math.PI * 2, true);
                        context.arc(420, 115, 65, 0, Math.PI * 2, true);
                        context.closePath();
                        context.clip();

                        const avatarShipA = await Canvas.loadImage(shipA.displayAvatarURL({ extension: 'jpg' }));
                        const avatarShipB = await Canvas.loadImage(shipB.displayAvatarURL({ extension: 'jpg' }));

                        // Draw a shape onto the main canvas
                        context.drawImage(avatarShipA, 50, 50, 145, 145);
                        context.drawImage(avatarShipB, 350, 50, 145, 145);

                        // Use the helpful Attachment class structure to process the file for you
                        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'shipping.png' });
                        const botReply = sayThis(matchRate);
                        await interaction.reply({ content:`Hmm... shipping ${shipA} and ${shipB}? ${botReply}`, files: [attachment] });
                } catch (ex) {
                        console.error(ex.message);
                        await interaction.reply('Sorry, got distracted... ask me that again.');
                }
	},
};