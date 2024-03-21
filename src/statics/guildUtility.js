const Guilds = require('../schemas/guilds')

/**
 * Retrieve a server's registration status by its identifier
 * @param {String} guildId Obtain the server's identifier
 */
Guilds.findByGuild = async function (guildId) {
    if(!guildId) {
        console.error(`Invalid request.`);
        return false;
    }
    return await this.findOne({ guildId: guildId });
}

/**
 * Remove a server from registration by its identifier
 * @param {String} guildId Obtain the server's identifier
 */
Guilds.removeGuild = async function (guildId) {
    if(!guildId) {
        console.error(`Invalid request.`);
        return false;
    }
    return await this.deleteOne({ guildId: guildId });
}

/**
 * Creates new document in guilds
 * @param {*} interaction Obtains the user's interaction.guild
 */
Guilds.registerGuild = async function (interaction) {
    const guildProfile = new Guilds({
        guildId: interaction.id,
        guildName: interaction.name,
        guildIcon: interaction.iconURL() ? interaction.iconURL() : null,
        registered: Date().toString(),
    });
    return await guildProfile.save();
}

/**
 * Update a guild's registered roles that bot uses for various administrative commands
 * @param {String} guildId Obtain the server's identifier
 * @param {Object} content Obtains an object of roles to replace and register in db
 */
Guilds.updateGuildRegisteredRoles = async function (docId, content) {
    if(!docId) {
        console.error(`Invalid request.`);
        return false;
    }
    await Guilds.findOneAndUpdate(
        { _id: docId },
        {$set: { rolesRegistered: content || [] } },
        { new: true }
    );

    return await this.findOne({ _id: docId }).select("rolesRegistered")
}

module.exports = Guilds;