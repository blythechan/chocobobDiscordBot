const fs = require('fs');
const { REST, Routes } = require('discord.js');
const { DISCORD_TOKEN, GUILD_ID, CLIENT_ID } = process.env;

module.exports = (client) => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync(`./src/commands`);
        let commandCounter = 0;
        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(`./src/commands/${folder}`)
                .filter(file => file.endsWith('.js'));
            const { commands, commandArray } = client;
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());
                commandCounter++;
            }
        }

        console.log(`Commands: ${commandCounter} retrieved and ready to be reloaded.`);

        const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
        const clientId = "1070431418750087342";
        const guild = "638933686930374687";//"910528126809948201"; 638933686930374687

        // Build the slash commands!
        try {
            console.log(`Started refreshing ${commandCounter} application (/) commands.`);

            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(Routes.applicationGuildCommands(clientId, guild),{ 
                body: client.commandArray 
            });

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    }
}