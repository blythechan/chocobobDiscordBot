const { Client, GatewayIntentBits, Collection, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Paginate = require('discordjs-paginate');

    const COLOR = "#efde7a";

    const BOT_EMBED = new EmbedBuilder()
        .setTitle(`Utility Commands`)
        .setColor(COLOR)
        .setDescription(`<i>Available utility commands</i>`)
        .addFields(
            { name: 'Ping', value: 'Command `/ping`' },
            { name: ' ', value: 'Checks and displays latency between bot and client.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
            { name: 'Purge Messages', value: 'Command `/purge user`' },
            { name: ' ', value: 'Removes up to 100 messages within the last 14 days on the current text-channel. User can be selected by the command itself. It is possible to select Chocobob. Success message will disappear after 10 seconds.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
            { name: 'Verify Character', value: 'Command `/verify server user`' },
            { name: ' ', value: 'Assists with connecting and verifying a Discord user to their FFXIV Lodestone character. Used to determine roles, nicknames, and permissions within the server.' },
            { name: ' ', value: 'Status:❌ TBD.' },
            { name: 'FFXIV Community News', value: 'Command `/headlines`' },
            { name: ' ', value: 'TBD, may change.' },
            { name: ' ', value: 'Status: ❌ TBD' }
        );
    const ECONOMY_EMBED = new EmbedBuilder()
        .setTitle(`Economy Commands`)
        .setColor(COLOR)
        .setDescription(`<i>FFXIV Marketboard commands</i>`)
        .addFields(
            { name: 'Market Board Search', value: 'Command `/mb item server`' },
            { name: ' ', value: 'Status: ❌ API support is being researched (likely Uiniversalis).' }
        );
    const FREECOMPANY_EMBED = new EmbedBuilder()
        .setTitle(`Free Company Commands`)
        .setColor(COLOR)
        .setDescription(`<i>FFXIV Free Company statistics commands</i>`)
        .addFields(
            { name: 'Free Company Statistics', value: 'Command `/fcstats fc server`' },
            { name: ' ', value: 'Lists Free Company data from FFFXIVAPI, and filters and paginates by 25 entries at a time. If two or more FCs share similar FC names, Chocobob will only retrieve the first result. Please be **specific**.' },
            { name: ' ', value: 'Status: ❌ Additional API support is being researched.' }
        );
    const FUN_EMBED = new EmbedBuilder()
        .setTitle(`Fun Commands`)
        .setColor(COLOR)
        .setDescription(`<i>Random commands</i>`)
        .addFields(
            { name: 'Head Pats', value: 'Command `/headpats`' },
            { name: ' ', value: 'Makes Chocobob blush and feel loved for all his hard work.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
            { name: 'Matchmaker', value: 'Command `/ship shipUserA shipUserB`' },
            { name: ' ', value: 'Jokingly determines a percentage of possibility between two users.' },
            { name: ' ', value: 'Status: :white_check_mark:' }
        );
    const DB_EMBED = new EmbedBuilder()
        .setTitle(`About Chocobob Bot`)
        .setColor(COLOR)
        .setDescription(`<i>Purpose, expectations, promises, the whole shebang.</i>`)
        .addFields(
            { name: 'Purpose and Promise of Chocobob', value: 'A fun Discord bot with various commands to not only entertain a Discord user but assist a FFXIV user along their journey throughout Eorzea and beyond.' },
            { name: ' ', value: 'All actions made by Chocobob require either a command or a command ran by a server moderator. Any data saved is strictly to log the execution of an action and the response created by Chocobob. Message history that is unrelated to a command will not and will never be saved.' },
            { name: 'Chocobob Bot Details', value: 'Chocobob#9508 is developed and maintained by Blythe Bleethe#6060. It relies heavily on FFXIVAPI, Lodestone API, and Dalamund Bridge. If you find that Chocobob is incorrectly using your art, is acting unpredictable, or could be improved, please DM Blythe Bleethe#6060.'}
        );
    const EMBEDS = [ BOT_EMBED, ECONOMY_EMBED, FREECOMPANY_EMBED, FUN_EMBED, DB_EMBED ];
    
    module.exports = {
        data: new SlashCommandBuilder()
            .setName('help')
            .setDescription('Lists commands.'),
        async execute(interaction) {
            // Send DM to the message's author
            interaction.user.send({ content: `Curious about my Kweh Powers, are you? *DM sent because you are a member of a mutal server: ${interaction.member.guild.name}. Do not reply to this message as I will have returned to my Chocobo Stable once you finish reading this.*`, embeds: EMBEDS })
                .then(sentMessage => interaction.reply(`I just sent you a DM about all my ~~Kwehbilities~~ commands!`))
                .catch(error => {
                    console.error(error.message);
                    interaction.reply(`I couldn't send you a DM about my ~~Kwehbilities~~ commands... well, the Kupo are rather buys these days.`)
                });
        },
    };