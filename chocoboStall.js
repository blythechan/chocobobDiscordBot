// /**
//  * Author: Blythe Bleethe#6060
//  * Purpose: Chocobob shall provide statistics, logs, and other data pertaining to FFXIV upon request. It will require administrative privlege to be able to read
//  * 		messages/message history, assist in role verification, and character verification via Lodestone. 
//  */
// const fs = require('node:fs');
// const path = require('node:path');

// const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require("discord.js");
// const { FFXIV_API_KEY, DISCORD_TOKEN, PREFIX } = require("dotenv").config();

// const options = {
// 	bypass: true,
// 	log: true,
// 	paths: [
// 	  'bot', 'economy', 'freeCompany',
// 	  'fun'
// 	]
//   };

// const client = new Client({ 
//     intents: [
//         GatewayIntentBits.Guilds, 
//         GatewayIntentBits.GuildMembers,
//         GatewayIntentBits.GuildMessages,
//         GatewayIntentBits.GuildEmojisAndStickers,
//         GatewayIntentBits.GuildPresences,
//         GatewayIntentBits.DirectMessages,
//         GatewayIntentBits.DirectMessageTyping,
//         GatewayIntentBits.MessageContent,
//         GatewayIntentBits.GuildScheduledEvents,
//         GatewayIntentBits.AutoModerationConfiguration
//     ] 
// });

// /// Commands
// client.commands = new Collection();
// // client.commands.set([]);
// const commandsPath = path.join(__dirname, 'commands');
// const commandFolders = fs.readdirSync(`${commandsPath}`);
// for(const folder of commandFolders) {
// 	const commandFiles = fs.readdirSync(`${commandsPath}/${folder}`).filter(file => file.endsWith('.js'));
// 	for (const file of commandFiles) {
// 		const filePath = path.join(commandsPath, folder, file);
// 		const command = require(filePath);
// 		// Set a new item in the Collection with the key as the command name and the value as the exported module
// 		if ('data' in command && 'execute' in command) {
// 			client.commands.set(command.data.name, command);
// 		} else {
// 			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
// 		}
// 	}
// }



// client.once("ready", () => {
	

// 	setInterval(client.pickPresence, 10 * 1000);

//     console.log('```````````````````````````````````````````````````````````````````````````````````');
//     console.log(`Logged in as ${client.user.tag}!`);
//     console.log('```````````````````````````````````````````````````````````````````````````````````');
// });

// client.on(Events.InteractionCreate, async interaction => {
// 	if (!interaction.isChatInputCommand()) return;

// 	const command = interaction.client.commands.get(interaction.commandName);

// 	if (!command) {
// 		console.error(`No command matching ${interaction.commandName} was found.`);
// 		return;
// 	}

// 	try {
// 		await command.execute(interaction);
// 	} catch (error) {
// 		console.error(error);
// 		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
// 	}
// });

// client.login(DISCORD_TOKEN);