const Guilds = require('../schemas/guilds');
const defaults = require('../functions/tools/defaults.json');

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

Guilds.updateHeadpatRoles = async function(docId, allowRoles, overwriteRoles ) {
    if(allowRoles !== undefined) {
        return await Guilds.findOneAndUpdate(
            { _id: docId._id },
            {$set: { allowHeadpatRoles: allowRoles } },
            { new: true }
        );
    } else if(overwriteRoles && overwriteRoles.length > 0) {
        return await Guilds.findOneAndUpdate(
            { _id: docId._id },
            {$set: { headpatRoles: overwriteRoles } },
            { new: true }
        );
    }
}

/**
 * Update a guild's registered roles that bot uses for various administrative commands
 * @param {String} docId Obtain the document identifier
 * @param {Object} content Obtains an object of roles to replace and register in db
 */
Guilds.updateGuildRegisteredRoles = async function (docId, content ) {
    if(!docId) {
        console.error(`Invalid request.`);
        return false;
    }

    await Guilds.findOneAndUpdate(
        { _id: docId },
        {$set: { rolesRegistered: content || [] } },
        { new: true }
    );

    return await this.findOne({ _id: docId }).select("rolesRegistered");
}

/**
 * Update a guild's free company Lodestone id
 * @param {String} docId Obtain the server's identifier
 * @param {Object} fcId Obtains an object of roles to replace and register in db
 */
Guilds.updateGuildFreeCompanyId = async function (docId, fcId) {
    if(!docId) {
        console.error(`Invalid request.`);
        return false;
    }

    await Guilds.findOneAndUpdate(
        { _id: docId },
        {$set: { fcId: fcId || "" } },
        { new: true }
    );

    return await this.findOne({ _id: docId }).select("fcId");
}

/**
 * Update a guild's registered feather categories
 */
Guilds.updateGuildFeatherCategories = async function (docId, content ) {
    if(!docId) {
        console.error(`Invalid request.`);
        return false;
    }

    await Guilds.findOneAndUpdate(
        { _id: docId },
        {$set: { featherRoles: content || defaults.FEATHER_CATS } },
        { new: true }
    );

    return await this.findOne({ _id: docId }).select("featherRoles");
}

module.exports = Guilds;