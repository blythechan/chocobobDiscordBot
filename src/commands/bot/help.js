const { SlashCommandBuilder } = require("discord.js");
const defaults = require("../../functions/tools/defaults.json");
const { customEmbedBuilder } = require('../../events/utility/handleEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lists commands."),
  async execute(interaction, client) {
    const EMBED = customEmbedBuilder(
        `Help is only a click away kweh!`,
        defaults.CHOCO_HAPPY_ICON,
        `My ~~kwehbilities~~ abilities are vast. Please check them out at: ${"https://github.com/hartleyk1/chocobobDiscordBot/blob/main/commands.md"}`,
        [
            { name: "Terms", value: "A fun Discord bot with various commands to not only entertain a Discord user but also assist a FFXIV user along their journey throughout Eorzea and beyond." },
            { name: " ", value: "All actions made by Chocobob require either a command or a command ran by a server moderator. Any data saved is strictly to log the execution of an action and the response created by Chocobob. Message history that is unrelated to a command will not and will never be saved." },
            { name: "Details", value: "Chocobob#9508 is developed and maintained by **blythechan**. It was primarily created for We're Bad at Names <BAN> Free Company in Sargatanas. It relies heavily on FFXIVAPI, Lodestone API, and FFXIV Collect." },
            { name: " ", value: "If you find that Chocobob is incorrectly using your art, is acting unpredictable, or could be improved, please DM **blythechan**." },
        ]
    );
    return interaction.reply({
        embeds: [EMBED],
        ephemeral: true
    });
  }
};
