const { Client, GatewayIntentBits, Collection, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Paginate = require('discordjs-paginate');

    const COLOR = "#efde7a";

    const BOT_EMBED = new EmbedBuilder()
        .setTitle(`Utility Commands`)
        .setColor(COLOR)
        .setDescription(`Available utility commands`)
        .addFields(
            { name: 'Ping', value: 'Command `/ping`' },
            { name: ' ', value: 'Checks and displays latency between bot and client.' },
            { name: ' ', value: 'Status: Finished.' },
            { name: 'Purge Messages', value: 'Command `/purge user`' },
            { name: ' ', value: 'Removes up to 100 messages within the last 14 days on the current text-channel. User can be selected by the command itself. It is possible to select Chocobob. Success message will disappear after 10 seconds.' },
            { name: ' ', value: 'Status: Finished.' },
            { name: 'Verify Character', value: 'Command `/verify server user`' },
            { name: ' ', value: 'Assists with connecting and verifying a Discord user to their FFXIV Lodestone character. Used to determine roles, nicknames, and permissions within the server.' },
            { name: ' ', value: '❌ Status: TBD.' },
            { name: 'FFXIV Community News', value: 'Command `/headlines`' },
            { name: ' ', value: 'TBD, may change.' },
            { name: ' ', value: '❌ Status: TBD.' }
        );
    const ECONOMY_EMBED = new EmbedBuilder()
        .setTitle(`Economy Commands`)
        .setColor(COLOR)
        .setDescription(`FFXIV Marketboard commands`)
        .addFields(
            { name: 'Market Board Search', value: 'Command `/mb item server`' },
            { name: ' ', value: '❌ Status: API support is being researched (likely Uiniversalis).' }
        );
    const FREECOMPANY_EMBED = new EmbedBuilder()
        .setTitle(`Free Company Commands`)
        .setColor(COLOR)
        .setDescription(`FFXIV Free Company statistics commands`)
        .addFields(
            { name: 'Free Company Statistics', value: 'Command `/fcstats fc server`' },
            { name: ' ', value: 'Lists Free Company data from FFFXIVAPI, and filters and paginates by 25 entries at a time. If two or more FCs share similar FC names, Chocobob will only retrieve the first result. Please be **specific**.' },
            { name: ' ', value: '❌ Status: Pagination is being worked on. Additional API support is being researched.' }
        );
    const FUN_EMBED = new EmbedBuilder()
        .setTitle(`Fun Commands`)
        .setColor(COLOR)
        .setDescription(`Random commands`)
        .addFields(
            { name: 'Head Pats', value: 'Command `/headpats`' },
            { name: ' ', value: 'Makes Chocobob blush and feel loved for all his hard work.' },
            { name: ' ', value: 'Status: Finished.' },
            { name: 'Matchmaker', value: 'Command `/ship shipUserA shipUserB`' },
            { name: ' ', value: 'Jokingly determines a percentage of possibility between two users.' },
            { name: ' ', value: '❌ Status: TBD.' }
        );
    const DB_EMBED = new EmbedBuilder()
        .setTitle(`Agreement from Developer`)
        .setColor(COLOR)
        .setDescription(`Purpose, expectations, promises, the whole shebang.`)
        .addFields(
            { name: 'Purpose and Promise of Chocobob', value: 'A fun Discord bot with various commands to not only entertain a Discord user but assist a FFXIV user along their journey throughout Eorzea and beyond.' },
            { name: ' ', value: 'All actions made by Chocobob require either a command or a command ran by a server moderator. Any data saved is strictly to log the execution of an action and the response created by Chocobob. Message history that is unrelated to a command will not and will never be saved.' },
        );
    const EMBEDS = [ BOT_EMBED, ECONOMY_EMBED, FREECOMPANY_EMBED, FUN_EMBED, DB_EMBED ];
    
    module.exports = {
        data: new SlashCommandBuilder()
            .setName('help')
            .setDescription('Lists commands.'),
        async execute(interaction) {
            // Send DM to the message's author
            interaction.user.send({ content: `Curious about my Kweh Powers, are you? *DM sent because you are a member of a mutal server: ${interaction.member.guild.name}. Do not reply to this message as I will have returned to my Chocobo Stable once you finish reading this.*`, embeds: EMBEDS });
        },
    };