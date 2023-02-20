
const { Client, GatewayIntentBits, Collection, AttachmentBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Embed } = require("discord.js");
const paginationEmbed = require('discordjs-v14-pagination');

const firstPageButton = new ButtonBuilder()
    .setCustomId('first')
    .setEmoji('1029435230668476476')
    .setStyle(ButtonStyle.Primary);

const previousPageButton = new ButtonBuilder()
    .setCustomId('previous')
    .setEmoji('1029435199462834207')
    .setStyle(ButtonStyle.Primary);

const nextPageButton = new ButtonBuilder()
    .setCustomId('next')
    .setEmoji('1029435213157240892')
    .setStyle(ButtonStyle.Primary);

const lastPageButton = new ButtonBuilder()
    .setCustomId('last')
    .setEmoji('1029435238948032582')
    .setStyle(ButtonStyle.Primary);

const buttons = [ firstPageButton, previousPageButton, nextPageButton, lastPageButton ];

const color = "#f2f28a";

function createEmbedPages(data, title, image) {
    const pageSize = 25;
    const pageCount = Math.ceil(data.length / pageSize);
    const embeds = [];
    for (let i = 0; i < pageCount; i++) {
        const start = i * pageSize;
        const end = start + pageSize;
        const pageData = data.slice(start, end);
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`${title} Page ${i + 1}/${pageCount}`)
            .setDescription(pageData.join('\n'))
            .setImage(image);
        embeds.push(embed);
    }

    return embeds;
}

function embedPagination(interaction, data, title, image) {
    const embeds = createEmbedPages(data, color, title, image);
    paginationEmbed(interaction, embeds, buttons, timeout);
}