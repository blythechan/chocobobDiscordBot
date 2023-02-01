const fs = require('node:fs');
const { Client, GatewayIntentBits, Collection } = require("discord.js");
require("dotenv").config();

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
        GatewayIntentBits.AutoModerationConfiguration
    ] 
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

/// Command prefix
const p = process.env.PREFIX;

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}
client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    if(!message.content.startsWith(p) || message.author.bot) return;

    // Remove prefix and for to lower case
    const args = message.content.slice(p.length).split(/ +/);
    const command = args.shift().toLowerCase();

    switch(command) {
        case 'ping':
            client.commands.get('ping').execute(message, args);
            break;
        case 'pong':
            client.commands.get('ping').execute(message, args);
            break;
        case 'headpats':
            client.commands.get('headpats').execute(message, args);
            break;
    } 
});


client.login(process.env.DISCORD_TOKEN);