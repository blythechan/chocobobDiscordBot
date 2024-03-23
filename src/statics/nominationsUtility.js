
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
    const existingNomination = await this.findOne({ guildId: guildId, nominatingId: nominatorId, nominatingRank: rank, nominatingRankId: rankId });
    if(existingNomination && existingNomination.expires > new Date()) {
        return "EXISTS";
    }
    const newDoc = new Nominations({ guildId: guildId, memberId: memberId, nominatingId: nominatorId, nominatingRank: rank, nominatingRankId: rankId }).save();
    return newDoc;
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

/**
 * Retrieve a nomination by its identifier in mongo
 * @param {String} guildId Obtains the server's identifier
 * @param {ObjectId} id Obtains the mongo document identifier representing the nomination
 */
Nominations.findNominationById = async function(guildId, id) {
    if(!guildId) {
        console.error(`Invalid request.`);
        return false;
    }

    return await this.findOne({ _id: id, guildId: guildId });
}

/**
 * Remove a nominaiton by its mongo document identifier
 * @param {ObjectId} id Obtains the mongo document identifier representing the nomination
 */
Nominations.removeNominationById = async function(id) {
    return await this.deleteOne({ _id: id });
}

/**
 * Update the nomination with the created message's id
 * @param {ObjectId} id Obtains the mongo document identifier representing the nomination
 * @param {String} messageId Obtains the message's identifier
 */
Nominations.updateNominationWithMessageId = async function(id, messageId) {
    return await this.updateOne({ _id: id }, { messageId: messageId });
}

/**
 * Update an existing nomination based on nomination reaction type: adding or removing
 * @param {String} messageId Obtains the message's identifier
 * @param {String} emoji Obtains the emoji the user is reacting too, unicode does not always work
 * @param {String} votingMemberId Obtains the voting user's identifier
 * @param {Boolean} removeVote Obtains the flag is the user is removing their vote
 */
Nominations.updateNominationScore = async function(messageId, emoji, votingMemberId, removeVote) {
    // '☑', '🇽', '❔'
    // '\u2611', '\uD83C\uDDFD', '\u2754'
    const ACCEPTED_EMOJIS = ['☑', '🇽', '❔'];
    if(!emoji || !ACCEPTED_EMOJIS.includes(emoji)) return [];
    const noms = this.findOne({ messageId: messageId }).lean();
    if(noms && noms.memberId !== votingMemberId && noms.nominatingId !== votingMemberId) {
            if(removeVote === true) {
                switch(emoji) {
                    case ACCEPTED_EMOJIS[0]:
                        return await this.updateOne({ messageId: messageId }, { $pull: { votersYes: votingMemberId } });
                    case ACCEPTED_EMOJIS[1]:
                        return this.updateOne({ messageId: messageId }, { $pull: { votersNo: votingMemberId } });
                    case ACCEPTED_EMOJIS[2]:
                        return this.updateOne({ messageId: messageId }, { $pull: { votersUnsure: votingMemberId } });
                    default:
                        return [];
                }
            } else {
                switch(emoji) {
                    case ACCEPTED_EMOJIS[0]:
                        return await this.updateOne({ messageId: messageId }, { $push: { votersYes: votingMemberId } });
                    case ACCEPTED_EMOJIS[1]:
                        return this.updateOne({ messageId: messageId }, { $push: { votersNo: votingMemberId } });
                    case ACCEPTED_EMOJIS[2]:
                        return this.updateOne({ messageId: messageId }, { $push: { votersUnsure: votingMemberId } });
                    default:
                        return [];
                }
            }
    } else {
        return false;
    }
}

/**
 * Retrieve nomination by discord message identifier
 * @param {String} messageId Obtains the message's identifier
 */
Nominations.findByMessageId = async function(messageId) {
    return await this.findOne({ messageId: messageId });
}

module.exports = Nominations;