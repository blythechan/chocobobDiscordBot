const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const mongoose = require('mongoose');
const XIVAPI = require('@xivapi/js');
const Character = require('../../schemas/character');
const Canvas = require('@napi-rs/canvas');
const xiv = new XIVAPI({
    private_key: process.env.FFXIV_API_KEY,
    language: 'en'
});

const applyText = (canvas, text) => {
    const context = canvas.getContext('2d');
    let fontSize = 60;

    do {
        context.font = `${fontSize -= 10}px MingLiU-ExtB`;
    } while (context.measureText(text).width > canvas.width - 200);

    return context.font;
};

const applySubText = (canvas, text) => {
    const context = canvas.getContext('2d');
    let fontSize = 40;

    do {
        context.font = `${fontSize -= 10}px Arial`;
    } while (context.measureText(text).width > canvas.width - 200);

    return context.font;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whoami')
        .setDescription(`Retrieves one of your character's data from the Lodestone.`),
    async execute(interaction) {
        const author = interaction.guild.members.cache.get(interaction.member.id);
        const lodestoneCharacter = await Character.findOne({ guildId: interaction.guild._id, memberId: author.user.id })

        let finalRes = undefined;
        if (lodestoneCharacter) {
            finalRes = await xiv.character.get(lodestoneCharacter.characterId);
        } else {
            return interaction.reply({
                content: `It does not appear that you've registered and verified your character with Chocobob. Try using the ${`/verify`} command.`,
                ephemeral: true
            });
        }

        console.log(finalRes.Character);

        const canvas = Canvas.createCanvas(640, 873);
        const context = canvas.getContext('2d');

        const background = await Canvas.loadImage(finalRes.Character.Portrait);
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        context.beginPath();
        context.fillStyle = "rgba(45, 46, 48, 0.8)";
        context.fillRect(20, 550, 600, 300);
        context.stroke();
        context.closePath();

        context.font = applyText(canvas, `${finalRes.Character.Name}`);
        context.fillStyle = 'WHITE';
        context.fillText(`${finalRes.Character.Name}`, 35, 600);

        context.font = applySubText(canvas, `${finalRes.Character.Server}, ${finalRes.Character.DC}`);
        context.fillStyle = 'WHITE';
        context.fillText(`${finalRes.Character.Server}, ${finalRes.Character.DC}`, 35, 650);

        const className = finalRes.Character.ActiveClassJob.UnlockedState && finalRes.Character.ActiveClassJob.UnlockedState.Name
            ? finalRes.Character.ActiveClassJob.UnlockedState.Name
            : finalRes.Character.ActiveClassJob.Name;
        context.font = applySubText(canvas, `${className} - ${finalRes.Character.ActiveClassJob.Level}`);
        context.fillStyle = 'WHITE';
        context.fillText(`${className} - Lv ${finalRes.Character.ActiveClassJob.Level}`, 35, 690);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'selfportrait.png' });
        await interaction.reply({ content: `WIP`, files: [attachment], ephemeral: true });

    },
};