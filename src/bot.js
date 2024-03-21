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
	// When a reaction is received, check if the structure is partial
	if (reaction.partial) {
		// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}
    
    const messageAuthorIsBot = reaction.message.author.bot;
    const reactionAuthorId = user.id;
    const reactionAuthorIsBot = user.bot;
    const messageCommand = reaction.message.interaction.commandName;
    const messageEmbedTitle = reaction.message.embeds ? reaction.message.embeds[0].data.title : "";
    if(messageCommand === "nominate" && messageEmbedTitle === "Nominations Vote" && !reactionAuthorIsBot && messageAuthorIsBot) {
        const messageId = reaction.message.id;
        // Retrieve the nomination
        const nominationMessage = await Nominations.findByMessageId(messageId);
        if(nominationMessage && nominationMessage.expires > new Date()) {
            // ignore the squiggly on emoji, it's lying
            await Nominations.updateNominationScore(nominationMessage.messageId, reaction._emoji.name, reactionAuthorId);
        } else {
            console.error(`Encountered an error during message reaction for ${messageEmbedTitle}`);
        }
    }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
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
    const reactionAuthorIsBot = user.bot;
    const messageCommand = reaction.message.interaction.commandName;
    const messageEmbedTitle = reaction.message.embeds ? reaction.message.embeds[0].data.title : "";

    if(messageCommand === "nominate" && messageEmbedTitle === "Nominations Vote" && !reactionAuthorIsBot && messageAuthorIsBot) {
        const messageId = reaction.message.id;
        const nominationMessage = await Nominations.findByMessageId(messageId);
        if(nominationMessage && nominationMessage.expires > new Date()) {
            await Nominations.updateNominationScore(nominationMessage.messageId, reaction._emoji.name, reactionAuthorId, true);
        } else {
            console.error(`Encountered an error during message reaction for ${messageEmbedTitle}`);
        }
    }
})

client.login(DISCORD_TOKEN);
(async () => {
    await connect(DB_TOKEN).catch(console.error);
})();