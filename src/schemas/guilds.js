const { Schema, model } = require('mongoose');

const guildSchema = new Schema({
    guildId: String,
    guildName: String,
    fcId: String,
    guildIcon: { type: String },
    allowHeadpatRoles: {
        type: Boolean,
        default: true
    },
    registered: String,
    rolesRegistered: {
        type: Array,
        default: []
    },
    headpatRoles: {
        type: Array,
        default: [
            { role: "Aspiring Indulger", limit: 5 },
            { role: "Gentle Hands", limit: 10 },
            { role: "Chocobob's BFF", limit: 2500 },
            { role: "Certified Headpatter", limit: 9000 }
        ]
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