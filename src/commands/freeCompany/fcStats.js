const fs = require('node:fs');
const { Client, GatewayIntentBits, Collection, AttachmentBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Embed } = require("discord.js");
const paginationEmbed = require('discordjs-v14-pagination');
require("dotenv").config();

const XIVAPI = require('@xivapi/js');
const xiv = new XIVAPI({
    private_key: process.env.FFXIV_API_KEY,
    language: 'en',
    snake_case: true
});

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

function createEmbedPages(data, color, title, image) {
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

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fcstats')
		.setDescription('Retrieve FC statistics')
            .addStringOption(option => option.setName('fc').setDescription('The Free Company full name to request statistics from').setRequired(true))
            .addStringOption(option => option.setName('server').setDescription('The Free Company full name to request statistics from').setRequired(true))
            .addBooleanOption(option => option.setName('fcstatsonly').setDescription('Only display FC stats, ignore FC members.')),
	async execute(interaction) {
        try {
        await interaction.deferReply();
        const fc = interaction.options.getString('fc');
        const fcServer = interaction.options.getString('server');
        const fcstatsonly = interaction.options.getBoolean('fcstatsonly');
		//find the FC with its name and server
        let res = await xiv.freecompany.search(fc, {server: fcServer});
        //get the FC ID
        let id = res.results[0].id;
        //get and return fc members
        let userFC = await xiv.freecompany.get(id, {data: 'FCM'});
        const fcm = userFC.free_company_members;
        //const fcs = await xiv.freecompany.get(id);
        const fcRanks = [];
        const data = fcm.map(player => {
            let rank = player.rank;
            fcRanks.push(rank);
            return `${player.name} - ${player.rank}`;
        });

        const uniqueRanks = fcRanks.reduce((acc, val) => {
            acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
            return acc;
          }, {});

        if(!fcstatsonly) {
            const embeds = createEmbedPages(data, "#f2f28a", `FC Member Retrieval`, userFC.free_company.crest[2]);
            paginationEmbed(interaction, embeds, buttons, 100000);
        }
        await interaction.editReply(`
        ${fcstatsonly ? "*Displaying FC Info Only*" : "*FC Info*"}
        Name: ${userFC.free_company.name} <${userFC.free_company.tag}>
        Slogan: ${userFC.free_company.slogan}
        Location: ${userFC.free_company.server}; ${userFC.free_company.estate.plot}
        Allied: ${userFC.free_company.grand_company}
        Formed: ${new Date(userFC.free_company.formed*1000)}
        Latest Activity: ${new Date(userFC.free_company.parse_date*1000)};
        Recruitment Status: ${userFC.free_company.recruitment}
        Total Members: ${userFC.free_company.active_member_count} / 512
        Ranks: ${Object.entries(uniqueRanks).map(x => ` ${x[0]}`)}
        Total Ranks: ${Object.keys(uniqueRanks).length} / 15
        Rank Breakdown: ${Object.entries(uniqueRanks).map(x => ` ${x[0]}: ${x[1]}`)}`);
        } catch (ex) {
            console.error(ex);
            await interaction.editReply(`Something went wrong, kweh! ${ex.message}`);
        }
	},
};