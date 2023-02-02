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

const embedTitle = "TEST";

// Build the embeds beforehand and place them inside an array
const embed1 = new EmbedBuilder().setTitle(`This is the first help page!`);
const embed2 = new EmbedBuilder().setTitle(`This is the second help page!`);
const embed3 = new EmbedBuilder().setTitle(`This is the third help page!`);
const embed4 = new EmbedBuilder().setTitle(`This is the third help page!`);
const embed5 = new EmbedBuilder().setTitle(`This is the third help page!`);
const embed6 = new EmbedBuilder().setTitle(`This is the third help page!`);
const embed7 = new EmbedBuilder().setTitle(`This is the third help page!`);
const embeds = [embed1, embed2, embed3, embed4, embed5, embed6, embed7];
module.exports = {
	data: new SlashCommandBuilder()
		.setName('fcstats')
		.setDescription('Retrieve FC statistics')
            .addStringOption(option => option.setName('fc').setDescription('The Free Company full name to request statistics from').setRequired(true))
            .addStringOption(option => option.setName('server').setDescription('The Free Company full name to request statistics from').setRequired(true))
            .addBooleanOption(option => option.setName('secret').setDescription('Whether or not the response should be secret')),
	async execute(interaction) {
        const fc = interaction.options.getString('fc');
        const fcServer = interaction.options.getString('server');
        const secret = interaction.options.getBoolean('secret') ?? false;
		//find the FC with its name and server
        let res = await xiv.freecompany.search(fc, {server: fcServer})
        //get the FC ID
        let id = res.results[1].id;
        //get and return fc members
        let userFC = await xiv.freecompany.get(id, {data: 'FCM'});
        // Pass in the array of message embeds and the discord.js message instance, then execute by using the exec() function
        // const testingHere = new Paginate(embeds, interaction.reply({ content: "Done", ephemeral: secret})).exec();
        // console.log(testingHere);
        const exampleEmbed = new EmbedBuilder()
            .setColor('#ac1eff')
            .setTitle(embedTitle)
            .setDescription('FC Members List')
            //.setThumbnail('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.catster.com%2Fwp-content%2Fuploads%2F2015%2F06%2Fcat-reading-shutterstock_97889852.jpg&f=1&nofb=1')
            .addFields(
                userFC.free_company_members.map(idx => {
                    console.log(idx.name);
                    return (
                        {
                            name: idx.name,
                            value: idx.rank,
                        }
                    );
                })
            );
            console.log("test");
        await interaction.reply({ embeds: [exampleEmbed], ephemeral: secret})
	},
};