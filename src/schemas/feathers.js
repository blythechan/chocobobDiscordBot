const { Schema, model } = require('mongoose');

const feathersSchema = new Schema({
    guildId:            String,
    memberId:           String,
    lastCategory:       String,
    totalFeathers:      Number,
    lastSender:         String,
    cat_combat:         Number,
    cat_crafting:       Number,
    cat_gathering:      Number,
    cat_leadership:     Number,
    cat_dedication:     Number,
    cat_chaos:          Number,
    cat_generosity:     Number
}, {
    timestamps:         true
});

module.exports = model("Feathers", feathersSchema, "feathers");