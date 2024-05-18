const Guilds = require ('../../statics/guildUtility');
const AdministrativeAction = require('../../statics/administrativeActionUtility');
const defaults = require('../../functions/tools/defaults.json');
const { customEmbedBuilder } = require('../../events/utility/handleEmbed');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CommandAudit = require('../../statics/commandAuditUtility');
const Nominations = require('../../statics/nominationsUtility');
const Feathers = require('../../statics/feathersUtility');

const botId             = "1070431418750087342";
const botOwnerId        = "139920603711930368";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("shipsettings")
		.setDescription("Tweak Chocobob's shipping formula")
        //.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option       => option.setName('shipa').setDescription('Mention the first user').setRequired(true))
        .addUserOption(option       => option.setName('shipb').setDescription('Mention the second user').setRequired(true))
        .addStringOption(option 	=> option.setName("shipalwaysabove").setDescription("Set the ship result to always be above, EX: 80"))
        .addStringOption(option 	=> option.setName("shipalwaysbelow").setDescription("Prevent the ship result from going above a number at, EX: 10")),
	async execute(interaction) {
		const userIsAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if(!userIsAdmin) {
            return interaction.reply({ content: 'Kweh! This command is restricted to server administrators only.', ephemeral: false });
        }
        
        const shipA     = interaction.options.getUser('shipa');
        const shipB     = interaction.options.getUser('shipb');
		const shipAbove = interaction.options.getString("shipalwaysabove");
		const shipBelow = interaction.options.getString("shipalwaysbelow");
        const GUILD_ID  = interaction.guild.id;

        // Prevent formula setting to be applied to the bot itself because Chocobob is mean like that
        if(shipA.id === botId || shipB.id === botId) {
            const EMBED = customEmbedBuilder(
				"Captain's Orders",
                defaults.CHOCO_STARE_ICON,
                `Kweh! I refuse to let you sway my heart like that.`
			);
			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
        // Ensure we have users to ship
        } else if (!shipA || !shipB) {
            const EMBED = customEmbedBuilder(
				"Captain's Orders",
                defaults.CHOCO_STARE_ICON,
                `Kweh! It seems you're missing a user to ship?`
			);
			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
        }

        const parsedShipBelow = shipBelow !== "" && shipBelow !== null ? parseInt(shipBelow, 10) : false;
        const parsedShipAbove = shipAbove !== "" && shipAbove !== null ? parseInt(shipAbove, 10) : false;
        // Lastly, ensure that the relationship is set
        if ((parsedShipBelow && parsedShipAbove) || (!parsedShipBelow && !parsedShipAbove)) {
            const EMBED = customEmbedBuilder(
				"Captain's Orders",
                defaults.CHOCO_STARE_ICON,
                `Kweh! I can only do a ship below or above, and that value must be a number.`
			);
			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
        }

        // Now begin the process of inserting
        const shipped = await Guilds.setShipRelationships(GUILD_ID, shipA, shipB, parsedShipAbove, parsedShipBelow);
        if(shipped) {
            const EMBED = customEmbedBuilder(
				"Captain's Orders",
                defaults.CHOCO_HAPPY_ICON,
                `The ship has been set, kweh~`
			);
			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
        } else {
            const EMBED = customEmbedBuilder(
				"Captain's Orders",
                defaults.CHOCO_SAD_ICON,
                `K-Kweh, I ran into an issue while setting up that ship. Please try again.`
			);
			return interaction.reply({
				embeds: [EMBED],
				ephemeral: true
			});
        }
    }
};