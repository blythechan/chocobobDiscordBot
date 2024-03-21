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
