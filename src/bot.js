require("dotenv").config();
const { DISCORD_TOKEN, DB_TOKEN } = process.env;
const { connect } = require('mongoose');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const Nominations = require ('../src/statics/nominationsUtility');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages
    ], 
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
client.commandArray = [];
client.color = "yellow";

/** FUNCTIONS */
const functionFolders = fs.readdirSync(`./src/functions`);
for(const folder of functionFolders) {
    const functionFiles = fs
        .readdirSync(`./src/functions/${folder}`)
        .filter(file => file.endsWith('.js'));
        for(const file of functionFiles) require(`./functions/${folder}/${file}`)(client);
}

client.handleEvents();
client.handleCommands();

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    try { 
        if (!reaction.message.guild || user.bot) return;

        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                return;
            }
        }
        
        const messageAuthorIsBot = reaction.message.author.bot;
        const reactionAuthorId = user.id;
        const messageCommand = reaction.message.interaction && reaction.message.interaction.commandName;
        const messageEmbedTitle = reaction.message.embeds && reaction.message.embeds && reaction.message.embeds[0] ? reaction.message.embeds[0].data.title : "";
        // #region Nomination reaction
        if(messageCommand === "nominate" && messageEmbedTitle === "Nominations Vote" && messageAuthorIsBot) {
            const messageId = reaction.message.id;
            // Retrieve the nomination
            const nominationMessage = await Nominations.findByMessageId(messageId);
            const selfVote = (nominationMessage.memberId === reactionAuthorId || nominationMessage.nominatingId === reactionAuthorId);
            if(nominationMessage && nominationMessage.expires > new Date()) {
                if ((nominationMessage.votersYes.length > 0 && nominationMessage.votersYes.includes(reactionAuthorId))
                || (nominationMessage.votersNo.length > 0 && nominationMessage.votersNo.includes(reactionAuthorId))
                || (nominationMessage.votersUnsure.length > 0 && nominationMessage.votersUnsure.includes(reactionAuthorId))
                || selfVote) {
                    reaction.users.remove(user);
                    const channel = reaction.message.guild.channels.cache.get(reaction.message.channelId);
                    const msgContent = selfVote
                        ? `You cannot vote on a nomination that you are a part of!`
                        : `${user}, you can only vote once on a nomination, kweh!`;
                    const sentMessage = await channel.send(`${msgContent}\n*This message will self-destruct in 5 seconds...*`);
                    setTimeout(() => {
                        sentMessage.delete();
                    }, 5000);
                } else {
                    await Nominations.updateNominationScore(nominationMessage.messageId, reaction._emoji.name, reactionAuthorId);
                }
            } else {
                const sentMessage = await channel.send(`Voting is closed for this nomination because it has expired.\n*This message will self-destruct in 8 seconds...*`);
                setTimeout(() => {
                    sentMessage.delete();
                }, 8000);
                console.error(`Encountered an error during message reaction for ${messageEmbedTitle}`);
            }
        }
        // #endregion
    } catch (error) {
        console.error("Encountered an error during message reaction: ", error)
    }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
    try {
        if (!reaction.message.guild || user.bot) return;

        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                return;
            }
        }
        
        const messageAuthorIsBot = reaction.message.author.bot;
        const reactionAuthorId = user.id;
        const messageCommand = reaction.message.interaction && reaction.message.interaction.commandName;
        const messageEmbedTitle = reaction.message && reaction.message.embeds && reaction.message.embeds[0] ? reaction.message.embeds[0].data.title : "";

        // #region Nomination vote removed
        if(messageCommand === "nominate" && messageEmbedTitle === "Nominations Vote" && messageAuthorIsBot) {
            const messageId = reaction.message.id;
            const nominationMessage = await Nominations.findByMessageId(messageId);
            if(nominationMessage && nominationMessage.expires > new Date()) {
                await Nominations.updateNominationScore(nominationMessage.messageId, reaction._emoji.name, reactionAuthorId, true);
            } else {
                console.error(`Encountered an error during message reaction for ${messageEmbedTitle}`);
            }
        }
        // #endregion
    } catch (error) {
        console.error("Encountered an error during message reaction removal: ", error)
    }
});

client.login(DISCORD_TOKEN);
(async () => {
    await connect(DB_TOKEN).catch(console.error);
})();