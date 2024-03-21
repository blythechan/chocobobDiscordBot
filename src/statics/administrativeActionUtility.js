
const AdminAction = require('../schemas/administrativeAction');

/**
 * Retrieve administrative action logs for a server (must be server that member is messaging from)
 * @param {String} guildId Obtains the server's identifier
 */
AdminAction.findLogsByGuild = async function (guildId) {
    if(!guildId) {
        console.error(`Invalid request.`);
        return false;
    }
    return await this.find({ }).where({ guildId: guildId }).sort({ _id: -1 }).limit(50);
}

/**
 * Retrieves logs related to a server member
 * @param {String} guildId Obtains the server's identifier
 * @param {String} memberId Obtains a server member's identifier
 */
AdminAction.findLogsByGuildMember = async function (guildId, memberId) {
    if(!guildId || !memberId) {
        console.error(`Invalid request.`);
        return false;
    }
    return await this.find({ }).where({ guildId: guildId, memberId: { id: memberId } }).sort({ _id: -1 }).limit(50);
}

/**
 * 
 * @param {String} guildId Obtains the server's identifier
 */
AdminAction.removeLogsByGuild = async function (guildId) {
    if(!guildId) {
        console.error(`Invalid request.`);
        return false;
    }
    return await this.deleteMany({ guildId: guildId });
}