const fs = require('node:fs');
const { Client, GatewayIntentBits, Collection, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
require("dotenv").config();

const XIVAPI = require('@xivapi/js');
const xiv = new XIVAPI({
    private_key: process.env.FFXIV_API_KEY,
    language: 'en',
    snake_case: true
});

const Paginate = require('discordjs-paginate');

const embedTitle = "Free Company Statistics";

// Build the embeds beforehand and place them inside an array
const embed1 = new EmbedBuilder().setTitle(`This is the first help page!`);
const embed2 = new EmbedBuilder().setTitle(`This is the second help page!`);
const embed3 = new EmbedBuilder().setTitle(`This is the third help page!`);
const embed4 = new EmbedBuilder().setTitle(`This is the third help page!`);
const embed5 = new EmbedBuilder().setTitle(`This is the third help page!`);
const embed6 = new EmbedBuilder().setTitle(`This is the third help page!`);
const embed7 = new EmbedBuilder().setTitle(`This is the third help page!`);
const embeds = [embed1, embed2, embed3, embed4, embed5, embed6, embed7];

const exampleEmbed = new EmbedBuilder()
    .setColor('#ac1eff')
    .setTitle(embedTitle)
    .setDescription('FC Members List');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('fcstats')
		.setDescription('Retrieve FC statistics')
            .addStringOption(option => option.setName('fc').setDescription('The Free Company full name to request statistics from').setRequired(true))
            .addStringOption(option => option.setName('server').setDescription('The Free Company full name to request statistics from').setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();
        const fc = interaction.options.getString('fc');
        const fcServer = interaction.options.getString('server');
		//find the FC with its name and server
        let res = await xiv.freecompany.search(fc, {server: fcServer});
        console.log(res);
        //get the FC ID
        let id = res.results[0].id;
        //get and return fc members
        let userFC = await xiv.freecompany.get(id, {data: 'FCM'});
        const fcm = userFC.free_company_members;
        console.log(fcm);
        // const slicedFCM = fcm.slice(0, 25);
		// console.log(slicedFCM);
        // slicedFCM.forEach(item => {
        //     exampleEmbed.addFields({
        //         name: item.name,
        //         value: item.rank
        //     })
        // });
            await interaction.followUp(`Test.`)
	},
};