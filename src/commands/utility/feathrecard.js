const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Feathers = require ('../../statics/feathersUtility');
const defaults = require('../../functions/tools/defaults.json');
const EMBED_TITLE = "Feather Card";
const featherImage = "https://ffxiv.gamerescape.com/w/images/thumb/8/85/Chocobo_Feather_Icon.png/96px-Chocobo_Feather_Icon.png";

/**
 * Retrieve a count of the user's feathers
 */

///// TO DO: Have score card be an embed.
module.exports = {
	data: new SlashCommandBuilder()
		.setName('feathercard')
		.setDescription('Want to see how many Chocobo Feathers you or another user have?')
		.addUserOption(option => option.setName('user').setDescription('Mention the user you want to see feather card for?').setRequired(false)),
	async execute(interaction, client) {
		const user = interaction.options.getUser("user");
        const requestor = interaction.guild.members.cache.get(interaction.member.id);
        const lookup = user ? user.id : requestor.id;
		const guildId = interaction.guild.id;
        const result = await Feathers.findFeathersByGuildMember(guildId, lookup);
        const whichUser = lookup === interaction.guild.members.cache.get(interaction.member.id)
            ? `<@${requestor.id}>`
            : `<@${lookup}>`;
        if(!result || result.length === 0) {

            const CARD_EMBED_NONE = new EmbedBuilder()
                .setTitle(EMBED_TITLE)
                .setColor(defaults.COLOR)
                .setDescription(`Kweh! ${whichUser} doesn't seem to have any feathers yet :pensive:`)
                .setThumbnail(featherImage)
                .addFields(
                    { name: 'Categories', value: ' '} ,
                    { name: ' ', value: `:crossed_swords: Combat: 0` },
                    { name: ' ', value: `:tools: Crafting: 0` },
                    { name: ' ', value: `:firecracker: Chaos: 0` },
                    { name: ' ', value: `:heart: Dedication:0` },
                    { name: ' ', value: `:gloves: Gathering: 0` },
                    { name: ' ', value: `:heart_hands: Generosity: 0` },
                    { name: ' ', value: `:star: Leadership: 0` },
                    { name: ' ', value: `Total: 0` }
                );
                
            return interaction.reply({
                embeds: [CARD_EMBED_NONE],
            });
        }
        else {
            const CARD_EMBED = new EmbedBuilder()
                .setTitle(EMBED_TITLE)
                .setColor(defaults.COLOR)
                .setDescription(`${whichUser}'s Feathers, kweh!`)
                .setThumbnail(featherImage)
                .addFields(
                    { name: 'Categories', value: ' '} ,
                    { name: ' ', value: `:crossed_swords: Combat: ${result.cat_combat || 0}` },
                    { name: ' ', value: `:tools: Crafting: ${result.cat_crafting || 0}` },
                    { name: ' ', value: `:firecracker: Chaos: ${result.cat_chaos || 0}` },
                    { name: ' ', value: `:heart: Dedication: ${result.cat_dedication || 0}` },
                    { name: ' ', value: `:gloves: Gathering: ${result.cat_gathering || 0}` },
                    { name: ' ', value: `:heart_hands: Generosity: ${result.cat_generosity || 0}` },
                    { name: ' ', value: `:star: Leadership: ${result.cat_leadership || 0}` },
                    { name: ' ', value: `Total: ${result.totalFeathers || 0}` }
                );

            return interaction.reply({
                embeds: [CARD_EMBED],
            });
    }
	}
}