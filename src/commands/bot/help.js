const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

    const COLOR = "#efde7a";

    const BOT_EMBED = new EmbedBuilder()
        .setTitle(`Utility Commands`)
        .setColor(COLOR)
        .setDescription(`**:gear: Available utility commands**`)
        .addFields(
            { name: 'Permissions', value: 'Command `/permissions user action reason notify ephemeral`' },
            { name: ' ', value: 'Description: Add or removes a role for a user, kicks the user, or bans the user.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
            { name: ' ', value: ' ' },
            { name: 'Ping', value: 'Command `/ping`' },
            { name: ' ', value: 'Description: Checks and displays latency between bot and client.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
            { name: ' ', value: ' ' },
            { name: 'Poll', value: 'Command `/poll description emoteA emoteB emoteC emoteD`' },
            { name: ' ', value: 'Description: Requires the user to be a server administrator. Creates a message with preset reactions.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
            { name: ' ', value: ' ' },
            { name: 'Purge Messages', value: 'Command `/purge user`' },
            { name: ' ', value: 'Description: Removes up to 100 messages within the last 14 days on the current text-channel. User can be selected by the command itself. It is possible to select Chocobob. Success message will disappear after 10 seconds.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
            { name: ' ', value: ' ' },
        );
    const SERVER_EMBED = new EmbedBuilder()
        .setTitle(`Server Commands`)
        .setColor(COLOR)
        .setDescription(`**:robot: Available server commands**`)
        .addFields(
            { name: 'Server Registration or "Server De-Registration"', value: 'Command `/server register`' },
            { name: ' ', value: 'Description: Allow Chocobob to log administrative actions, support FFXIV players with their Lodestone, and much more, by registering with Chocobob. "De-registering" with Chocobob will involve the removal of most if not all data related to your server.\n\nIt is **not** required to register with Chocobob, but some commands may not be available.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
            { name: ' ', value: ' ' },
            { name: 'Server Log', value: 'Command `/log channel`' },
            { name: ' ', value: 'Description: Retrieves the latest 50 logs pertaining to your server, and attempts to export it into a text file before sending it off to the specified text channel. Success response is ephemeral, but the export is visible to all depending on text channel.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
            { name: ' ', value: ' ' },
        );
    const ECONOMY_EMBED = new EmbedBuilder()
        .setTitle(`Economy Commands`)
        .setColor(COLOR)
        .setDescription(`**:moneybag: FFXIV Marketboard commands**`)
        .addFields(
            { name: 'Market Board Search', value: 'Command `/mb item server`' },
            { name: ' ', value: 'Description: TBD.' },
            { name: ' ', value: 'Status: ❌ API support is being researched (likely Uiniversalis).' }
        );
    const FREECOMPANY_EMBED = new EmbedBuilder()
        .setTitle(`FFXIV Commands`)
        .setColor(COLOR)
        .setDescription(`:chart: FFXIV related statistics (and more) commands`)
        .addFields(
            { name: 'Free Company Statistics', value: 'Command `/fcstats fc server fcstatsonly`' },
            { name: ' ', value: 'Description: Lists Free Company data from FFFXIVAPI, and filters and paginates by 25 entries at a time. If two or more FCs share similar FC names, Chocobob will only retrieve the first result. Please be **specific**.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
            { name: ' ', value: ' ' },
            { name: 'Free Company Member Export', value: 'Command `/fcexport fc server channel`' },
            { name: ' ', value: 'Description: Lists Free Company member names and rank in a CSV text file. If two or more FCs share similar FC names, Chocobob will only retrieve the first result. Please be **specific**.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
            { name: ' ', value: ' ' },
            { name: 'Latest Lodestone News', value: 'Command `/lodestone lookup`' },
            { name: ' ', value: 'Description: Retrieves the latest or current news article depending on lookup. PST timezone enforced. Maintenance lookup assumed if no option is provided.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
            { name: ' ', value: ' ' },
            { name: 'Verify Character', value: 'Command `/verify server user`' },
            { name: ' ', value: 'Description: Assists with connecting and verifying a Discord user to their FFXIV Lodestone character. Used to determine roles, nicknames, and permissions within the server.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
            { name: ' ', value: ' ' },
            { name: 'Who Am I', value: 'Command `/whoami charactername colorcode`' },
            { name: ' ', value: 'Description: Displays one of your registered characters in a Character Card created by Chocobob Bot.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
            { name: ' ', value: ' ' },
        );
    const FUN_EMBED = new EmbedBuilder()
        .setTitle(`Fun Commands`)
        .setColor(COLOR)
        .setDescription(`**:yum: Random commands**`)
        .addFields(
            { name: 'Head Pats', value: 'Command `/headpats`' },
            { name: ' ', value: 'Description: Makes Chocobob blush and feel loved for all his hard work.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
            { name: ' ', value: ' ' },
            { name: 'Ship', value: 'Command `/ship shipUserA shipUserB`' },
            { name: ' ', value: 'Description: Jokingly determines a percentage of possibility between two users.' },
            { name: ' ', value: 'Status: :white_check_mark:' },
        );
    const DB_EMBED = new EmbedBuilder()
        .setTitle(`About Chocobob Bot`)
        .setColor(COLOR)
        .setDescription(`**:rose: Purpose, expectations, promises, the whole shebang.**`)
        .addFields(
            { name: 'Purpose and Promise of Chocobob', value: 'A fun Discord bot with various commands to not only entertain a Discord user but also assist a FFXIV user along their journey throughout Eorzea and beyond.' },
            { name: ' ', value: 'All actions made by Chocobob require either a command or a command ran by a server moderator. Any data saved is strictly to log the execution of an action and the response created by Chocobob. Message history that is unrelated to a command will not and will never be saved.' },
            { name: 'Chocobob Bot Details', value: 'Chocobob#9508 is developed and maintained by Blythe#6060. It relies heavily on FFXIVAPI, Lodestone API, and Dalamund Bridge. If you find that Chocobob is incorrectly using your art, is acting unpredictable, or could be improved, please DM Blythe#6060.'}
        );
    const EMBEDS = [ BOT_EMBED, SERVER_EMBED, ECONOMY_EMBED, FREECOMPANY_EMBED, FUN_EMBED, DB_EMBED ];
    
    module.exports = {
        data: new SlashCommandBuilder()
            .setName('help')
            .setDescription('Lists commands.'),
        async execute(interaction, client) {
            // Send DM to the message's author
            interaction.user.send({ content: `Curious about my Kweh Powers, are you?\n\n*DM sent because you are a member of a mutal server: **${interaction.member.guild.name}**. Do not reply to this message as I will have returned to my Chocobo Stable once you finish reading this.*`, embeds: EMBEDS })
                .then(sentMessage => interaction.reply({ content: `I just sent you a DM about all my ~~Kwehbilities~~ commands!`, ephemeral: true }))
                .catch(error => {
                    console.error(error.message);
                    interaction.reply({ content: `I couldn't send you a DM about my ~~Kwehbilities~~ commands... well, the Kupo are rather buys these days.`, ephemeral: true })
                });
        },
    };