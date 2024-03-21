
const Nominations = require('../schemas/nominations');

/**
 * Retrieve nominations by a member's identifier in a specific server
 * @param {String} guildId Obtains the server's identifier
 * @param {String} memberId Obtains the server member's identifier
 * @param {Boolean} onlyExpired Obtains expired nominations that have not yet been purged if true
 */
Nominations.retrieveNominaitons = async function (guildId, memberId, onlyExpired) {
    if(!guildId || !memberId) {
        console.error(`Invalid request.`);
        return false;
    }
    if(onlyExpired === true) {
        return await this.findOne({ guildId: guildId, memberId: memberId, expires: { $lte: new Date() } });
    } else {
        return await this.findOne({ guildId: guildId, memberId: memberId, expires: { $$gte: new Date() } });
    }
}

/**
 * Nominate a user
 * @param {String} guildId Obtains the server's identifier
 * @param {Object} member Obtains the server member's nominater information
 * @param {Object} nominator Obtains the member's information that is being nominated
 * @param {String} rank Obtains the subsequent rank
 * @param {String} rankId Obtains the subsequent rank identifier
 */
Nominations.nominateUser = async function (guildId, memberId, nominatorId, rank, rankId) {
    if(!guildId || !memberId) {
        console.error(`Invalid request.`);
        return false;
    }
    // First verify the member is not already being actively nominated
    const existingNomination = await this.findOne({ guildId: guildId, memberId: memberId, nominatingId: nominatorId, expires: { $lte: new Date() } });
    if(existingNomination && existingNomination.length > 0) {
        return false;
    }
    const newDoc = new Nominations({ guildId: guildId, memberId: memberId, nominatingId: nominatorId, nominatingRank: rank, nominatingRankId: rankId });
    newDoc.save();
    return await this.findOne({ guildId: guildId, memberId: memberId, nominatingId: nominatorId, expires: { $gte: new Date() } });
}

/**
 * Remove one or more nominations
 * @param {String} guildId Obtains the server's identifier
 * @param {Object} member Obtains the server member's nominater information
 * @param {Object} nominator Obtains the member's information that is being nominated
 * @param {String} rank Obtains the subsequent rank
 * @param {String} rankId Obtains the subsequent rank identifier
 * @param {Date} expired Obtains the expiration threshold
 */
Nominations.removeNominations = async function(guildId, member, nominator, rank, rankId, expired) {
    if(!guildId || !member) {
        console.error(`Invalid request.`);
        return false;
    }
    const filters = [];
    if(!guildId || !rank || !rankId) {
        console.error(`Invalid request.`);
        return false;
    } else {
        filters.push({ guildId: guildId });
    }

    if(member) filters.push({ member: member });
    if(nominator) filters.push({ nominating: nominator });
    if(rank) filters.push({ nominatingRank: rank });
    if(rankId) filters.push({ nominatingRankId: rankId });
    if(expired) filters.push({ expires: { $$lte: new Date() } });
    return await this.deleteMany(filters);
}

Nominations.findNominationById = async function(guildId, id) {
    if(!guildId) {
        console.error(`Invalid request.`);
        return false;
    }

    return await this.findOne({ _id: id, guildId: guildId });
}

Nominations.removeNominationById = async function(id) {
    return await this.deleteOne({ _id: id });
}

module.exports = Nominations;