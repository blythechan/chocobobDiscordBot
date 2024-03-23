const { Schema, model } = require('mongoose');

const guildSchema = new Schema({
    guildId: String,
    guildName: String,
    guildIcon: { type: String },
    registered: String,
    rolesRegistered: {
        type: Array,
        default: []
    },
    featherRoles: {
        type: Array,
        default: [
            { cat: "Combat", role: "Warrior", limit: 1 }, 
            { cat: "Crafting", role: "Santa Helper", limit: 1 }, 
            { cat: "Chaos", role: "Gremlin", limit: 1 }, 
            { cat: "Dedication", role: "Number One Fan", limit: 1 }, 
            { cat: "Gathering", role: "Janitor", limit: 1 },
            { cat: "Generosity", role: "UWU", limit: 1 }, 
            { cat: "Leadership", role: "BDE", limit: 1 }
        ]
    }
}, {
    timestamps:         true
});

module.exports = model("Guilds", guildSchema, "guilds");