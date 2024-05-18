const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Guilds = require("../../statics/guildUtility");
const Nominations = require("../../statics/nominationsUtility");
const CommandAudit = require("../../statics/commandAuditUtility");
const defaults = require("../../functions/tools/defaults.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nominate")
    .setDescription("Nominate someone for a promotion!")
    .addStringOption((option) =>
      option
        .setName("removenomination")
        .setDescription("Provide the id of the nomination you want to remove")
        .setRequired(false)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Which user do you want to nominate?")
        .setRequired(false)
    ),
  async execute(interaction) {
    const guildProfile = await Guilds.findByGuild(interaction.guild.id);
    const guildId = interaction.guild.id;

    let author = interaction.guild.members.cache.get(interaction.member.id);

	const userIsAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

    // Verify command is past cooldown
    const verifyCooldown = await CommandAudit.checkCooldown(
      guildId,
      author,
      "nominate",
      "5 minutes"
    );
    if (!verifyCooldown) {
      if (!userIsAdmin) {
        const messagecontent = defaults.DEFAULT_RESPONSES[1].replace(
          "COOLDOWN_LIMIT",
          "5"
        );
        const CARD_EMBED_ERROR1 = new EmbedBuilder()
          .setColor(defaults.COLOR)
          .setDescription(messagecontent)
          .setThumbnail(defaults.CHOCO_SAD_ICON);
        await interaction.editReply({ embeds: [CARD_EMBED_ERROR1] });
        return;
      }
    }

    if (!guildProfile) {
      const CARD_EMBED_STATUS1 = new EmbedBuilder()
        .setTitle("Server Not Registered with Chocobo Stall!")
        .setColor(defaults.COLOR)
        .setDescription(
          "This command requires that you be registered with Chocobob. Request a server administrator to use the `/server register` command."
        );

      return interaction.reply({
        embeds: [CARD_EMBED_STATUS1],
        ephemeral: true,
      });
    } else if (guildProfile.rolesRegistered.length === 0) {
      const CARD_EMBED_STATUS2 = new EmbedBuilder()
        .setTitle("Server Not Registered with Chocobo Stall!")
        .setColor(defaults.COLOR)
        .setDescription(
          "Kweh! This command requires this server's main roles to be registered with Chocobob so that it can nominate properly! Request a server administrator to use the `/server roles` command."
        );

      return interaction.reply({
        embeds: [CARD_EMBED_STATUS2],
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser("user");
    const removenoms = interaction.options.getString("removenomination");
    if (removenoms && removenoms !== null) {
      let member = interaction.guild.members.cache.get(interaction.member.id);
      const nominationDocument = await Nominations.findNominationById(
        guildProfile.guildId,
        removenoms
      );

      // Nomination document exists
      if (nominationDocument && nominationDocument !== null) {
        // Check ownership and privlege
        if (nominationDocument.memberId === member.id || userIsAdmin) {
          await Nominations.removeNominationById(nominationDocument._id);
          const CARD_EMBED_REM = new EmbedBuilder()
            .setTitle("Nomination Removed")
            .setDescription(
              `Nomination ${nominationDocument.nominatingId} has been removed. Due to Discord message deletion restrictions, I cannot remove the associated nomination message automatically, kweh!`
            )
            .setColor(defaults.COLOR);

          return interaction.reply({
            embeds: [CARD_EMBED_REM],
            ephemeral: true,
          });
        } else {
          const CARD_EMBED_ERROR = new EmbedBuilder()
            .setTitle("Nomination Ownership Error")
            .setColor(defaults.COLOR)
            .setDescription(
              "Kweh! I can't remove that nomination because you are neither the initiator of that nominator nor a server administrator."
            );

          return interaction.reply({
            embeds: [CARD_EMBED_ERROR],
            ephemeral: true,
          });
        }
      } else {
        const CARD_EMBED_ERROR = new EmbedBuilder()
          .setTitle("Nomination Error")
          .setColor(defaults.COLOR)
          .setDescription(
            "K-Kweh! That nomination doesn't seem to exist in my Chocobo Stall! If this is because you are still seeing that nomination message, trying removing it via Discord."
          );

        return interaction.reply({
          embeds: [CARD_EMBED_ERROR],
          ephemeral: true,
        });
      }
    }
    const nominator = interaction.guild.members.cache.get(
      interaction.member.id
    );
    // Retrieve the member's roles
    const member = interaction.guild.members.cache.get(user.id);
    const memberRoles = member.roles.cache;
    const roleExceptions = guildProfile.roleExceptions || [];

    if (member === nominator) {
      const CARD_EMBED_NOM_ERR = new EmbedBuilder()
        .setTitle("Self-Nomination Error")
        .setColor(defaults.COLOR)
        .addFields({ name: " ", value: "You cannot nominate yourself." });

      return interaction.reply({
        embeds: [CARD_EMBED_NOM_ERR],
        ephemeral: true,
      });
    } else if (roleExceptions && roleExceptions.length > 0) {
      let exceptionFlag = false;
      memberRoles.forEach((role) => {
        if (roleExceptions.some((obj) => obj.role === role.name)) {
          exceptionFlag = true;
          return;
        }
      });
      if (exceptionFlag) {
        const CARD_EMBED_NOM_ERR = new EmbedBuilder()
          .setTitle("Nomination Error")
          .setColor(defaults.COLOR)
          .addFields({
            name: " ",
            value:
              "That user is excluded from nominations due to their server roles.",
          });

        return interaction.reply({
          embeds: [CARD_EMBED_NOM_ERR],
          ephemeral: true,
        });
      }
    }

    // Determine which server roles the user may already have
    // let nextRole = [];
    let hasRoles = [];

    guildProfile.rolesRegistered.forEach((role) => {
      let hasRole = memberRoles.has(role.id);
      if (hasRole) {
        hasRoles.push(role);
      }
    });

    const newRole = getNextHighestRoleForNoms(
      hasRoles,
      guildProfile.rolesRegistered
    );

    if (newRole && newRole !== null && newRole.id) {
      // Insert nomination first
      const result = await Nominations.nominateUser(
        guildProfile.guildId,
        nominator.id,
        user.id,
        newRole.name,
        newRole.id
      );
      if (!result || result === null || result === "EXISTS") {
        const errorMsg =
          result === "EXISTS"
            ? "I wasn't able to nominate that user due to an active nomination."
            : "I wasn't able to nominate that user due to an error.";
        const errorTitle =
          result === "EXISTS"
            ? "Nomination Ongoing for that User"
            : "Nomination Error";
        const CARD_EMBED_NOM_ERR = new EmbedBuilder()
          .setTitle(errorTitle)
          .setColor(defaults.COLOR)
          .setThumbnail(defaults.CHOCO_SAD_ICON)
          .addFields({ name: " ", value: errorMsg });

        return interaction.reply({
          embeds: [CARD_EMBED_NOM_ERR],
        });
      }

      const CARD_EMBED_NOM = new EmbedBuilder()
        .setTitle("Nominations Vote")
        .setColor(defaults.COLOR)
        .setThumbnail(defaults.CHOCO_HAPPY_ICON)
        .setDescription(
          `${user} has been nominated by ${nominator} for a promotion to <@&${newRole.id}>!`
        )
        .addFields(
          { name: " ", value: `Nomination Id: ${result._id}` },
          { name: " ", value: `Voting closes on ${result.expires}` },
          { name: " ", value: " " },
          { name: ":ballot_box_with_check: Yes", value: " " },
          { name: ":regional_indicator_x: No", value: " " },
          { name: ":grey_question: Undecided", value: " " }
        );
      const message = await interaction.reply({
        embeds: [CARD_EMBED_NOM],
        fetchReply: true,
      });

      CommandAudit.createAudit(guildId, author, "nominate");
      await Nominations.updateNominationWithMessageId(result._id, message.id);

      message.react("\u2611");
      message.react("\uD83C\uDDFD");
      message.react("\u2754");
    } else {
      const CARD_EMBED_NOM = new EmbedBuilder()
        .setTitle("Nominations")
        .setColor(defaults.COLOR)
        .setThumbnail(defaults.CHOCO_SAD_ICON)
        .addFields({
          name: " ",
          value: `${user} is being nominated by ${nominator}, but ${user} already has all available server roles.`,
        });

      return interaction.reply({
        embeds: [CARD_EMBED_NOM],
      });
    }
  },
};

/**
 * Retrieve the user's next highest role
 * @param {Array} userRoles Obtains the users server roles
 * @param {Array} rolesRegistered Obtains the server's register roles
 * @returns Returns role object or null
 */
function getNextHighestRoleForNoms(userRoles, rolesRegistered) {

  // Sort serverRoles by rawPosition in ascending order
  const sortedServerRoles = rolesRegistered
    .slice()
    .sort((a, b) => a.rawPosition - b.rawPosition);

  // Find the highest rawPosition among userRoles
  let highestUserRolePosition = Math.max(
    ...userRoles.map((role) => role.rawPosition)
  );

  // Find the next role in sortedServerRoles that the user does not have and is higher in position
  for (const role of sortedServerRoles) {
    if (
      role.rawPosition > highestUserRolePosition &&
      !userRoles.some((userRole) => userRole.id === role.id)
    ) {
      return role;
    }
  }

  // Return null if no higher role is found
  return null;
}
