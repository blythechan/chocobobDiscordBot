const { Schema, model } = require('mongoose');

const guildSchema = new Schema({
    guildId: String,
    guildName: String,
    guildIcon: { type: String },
    registered: String,
    rolesRegistered: {
        type: Array,
        default: []
    }
}, {
    timestamps:         true
});

module.exports = model("Guilds", guildSchema, "guilds");