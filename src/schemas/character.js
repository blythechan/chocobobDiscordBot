const { Schema, model } = require('mongoose');

const characterSchema = new Schema({
    _id:                Schema.Types.ObjectId,
    guildId:            String,
    characterName:      String,
    characterId:        String,
    characterServer:    Object,
    lodestoneToken:     String,
    memberId:           String,
    verified:           Boolean,
    createdAt:          String,
    updatedAt:          String,
});

module.exports = model("Character", characterSchema, "characters");

characterSchema.statics.findByMemberId = (id) => {
    return this.findOne({ memberId: id });
}

characterSchema.statics.findByCharacter = (characterName, characterId, memberId) => {
    let query = this.findOne();
    let filters = [];
    if(characterName) {
        filters.push({
            characterName: characterName
        });
    }

    if(characterId) {
        filters.push({
            characterId: characterId
        });
    }

    if(memberId) {
        filters.push({
            memberId: memberId
        });
    }

    for(let i = 0; i < filters.length; i++) {
        query.where(filters[i].fieldName).equals(filters[i].value);
    }
    return query.exec();
}

characterSchema.statics.removeCharacter = (characterName, characterId, memberId) => {
    return this.findOne({ $or:{ characterName: characterName, characterId: characterId }, memberId: memberId }).remove().exec();
}