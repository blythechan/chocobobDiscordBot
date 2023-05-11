const Guild = require('../../schemas/guild');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Registers your server with Chocobob. Server Administrators command.')
		.addStringOption(option => option.setName('register').setDescription('Register or De-Register from Chocobob?').setAutocomplete(true).setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async autocomplete(interaction, client) {
		const focusedValue = interaction.options.getFocused();
		const choices = ["Register", "Deregister"];
		const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
		await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
	},
	async execute(interaction, client) {
		const choice = interaction.options.getString('register').toLowerCase();
		let guildProfile = await Guild.findOne({ guildId: interaction.guild.id });
		
		if (choice === "register") {
			const registering = `Registering a server with Chocobob's Stall means that Chocobob can successfully keep track of administrative commands, assist in FFXIV player Lodestone registering, and more. You can remove a server from Chocobob's Stall via the ${`/server deregister`} command. Chocobob **does not** require a server to be registered.`;
			if (!guildProfile) {
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
		} else if (choice === "deregister") {
			const deregistering = `Removing a server from Chocobob's Stall means that any logs or data captured by Chocobob will be removed. No administrative commands, FFXIV player Lodestone registering, or other logs will be saved. Chocobob **does not** require a server to be registered.`;
			if (!guildProfile) {
				await interaction.reply({
					content: `*Server does not appear to be registered to Chocobo Stall*.`
				});
			} else {
				await guildProfile.deleteOne({ guildId: guildProfile.guildId }).catch(console.error);
				await interaction.reply({
					content: `*Server was removed from the Chocobo Stall Database*.\n\n${deregistering}`
				});

			}
		}
	}
};