const Guild = require('../../schemas/guild');
const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('serverregister')
		.setDescription('Registers your server with Chocobob.'),
	async execute(interaction, client) {
		let guildProfile = await Guild.findOne({ guildId: interaction.guild.id });
		const registering = `Registering a server with Chocobob's Stall means that Chocobob can successfully keep track of administrative commands, assist in FFXIV player Lodestone registering, and more. You can remove a server from Chocobob's Stall via the ${`/serverderegister remove`} command. Chocobob **does not** require a server to be registered.
		`;
        if(!guildProfile) {
            guildProfile = await new Guild({
				_id: new mongoose.Types.ObjectId(),
				guildId: interaction.guild.id,
				guildName: interaction.guild.name,
				guildIcon: interaction.guild.iconURL() ? interaction.guild.iconURL() : null,
				registered: Date().toString(),
			});
			await guildProfile.save().catch(console.error);
			await interaction.reply({
				content: `*Server Registered to Chocobo Stall*\nServer Name: ${guildProfile.guildName}\nServer Id: ${guildProfile.guildId}\n\n${registering}`
			});
        } else {
			await interaction.reply({
				content: `*Server Already Exists in Chocobo Stall*\nServer Name: ${guildProfile.guildName}\nServer Id: ${guildProfile.guildId}\n\n${registering}`
			});
		}

	}
};