const { Schema, model } = require('mongoose');

const guildSchema = new Schema({
    _id: Schema.Types.ObjectId,
    guildId: String,
    guildName: String,
    guildIcon: { type: String },
    registered: String,
});

module.exports = model("Guild", guildSchema, "guilds");