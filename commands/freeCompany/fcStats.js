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
            .addStringOption(option => option.setName('server').setDescription('The Free Company full name to request statistics from').setRequired(true)),
	async execute(interaction) {
        try {
        await interaction.deferReply();
        const fc = interaction.options.getString('fc');
        const fcServer = interaction.options.getString('server');
		//find the FC with its name and server
        let res = await xiv.freecompany.search(fc, {server: fcServer});
        //get the FC ID
        let id = res.results[0].id;
        //get and return fc members
        let userFC = await xiv.freecompany.get(id, {data: 'FCM'});
        const fcm = userFC.free_company_members;
        const fcs = await xiv.freecompany.get(id);
        const data = fcm.map(player => {
            return `${player.name} - ${player.rank}`;
        });
        const embeds = createEmbedPages(data, "#f2f28a", `FC Member Retrieval`, fcs.free_company.crest[2]);
        paginationEmbed(interaction, embeds, buttons, 100000);
        await interaction.editReply(`
            **FC Info**
            FC: ${fcs.free_company.name} - ${fcs.free_company.tag}
            Slogan: ${fcs.free_company.slogan}
            Location: ${fcs.free_company.server}; ${fcs.free_company.estate.plot}
            Formed: ${new Date(fcs.free_company.formed*1000)}
            Recruitment Status: ${fcs.free_company.recruitment}
            Total Members: ${fcs.free_company.active_member_count}`);
        } catch (ex) {
            console.error(ex);
            await interaction.editReply(`Something went wrong, kweh! ${ex.message}`);
        }
	},
};