const Character = require('../schemas/character');

/**
 * Retrieves a server member's information by their server identifier
 * @param {String} id Obtains server member's identifier
 */
Character.findByMemberId = (id) => {
    return this.findOne({ memberId: id });
}

/**
 * Finds a FFXIV character
 * @param {String} characterName  Obtains the character's first and last name
 * @param {String} characterId Obtains the character's Square-Enix (SE) identifier
 * @param {String} memberId Obtains the server member's identifier
 */
Character.findByCharacter = async function (characterName, characterId, memberId) {
    let query = this.findOne();
    let filters = [];
    if(characterName) {
        filters.push({ characterName: characterName });
    }

    if(characterId) {
        filters.push({ characterId: characterId });
    }

    if(memberId) {
        filters.push({ memberId: memberId });
    }

    for(let i = 0; i < filters.length; i++) {
        query.where(filters[i].fieldName).equals(filters[i].value);
    }
    return await query.exec();
}

/**
 * Removes the character from registration/verification
 * @param {String} characterName  Obtains the character's first and last name
 * @param {String} characterId Obtains the character's Square-Enix (SE) identifier
 * @param {String} memberId Obtains the server member's identifier
 */
Character.removeCharacter = async function  (characterName, characterId, memberId) {
    return await this.findOne({ $or:{ characterName: characterName, characterId: characterId }, memberId: memberId }).remove().exec();
}

module.exports = Character;