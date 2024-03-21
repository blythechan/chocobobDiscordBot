const { Schema, model } = require('mongoose');

const nominationsSchema = new Schema({
    guildId:            String,
    memberId:           String,
    nominatingId:       String,
    nominatingRank:     String,
    nominatingRankId:   String,
    // Default is two weeks unless otherwise provided on insert
    expires:            { type: Date, default: () => new Date(+new Date() + 14*24*60*60*1000) }
}, {
    timestamps:         true
});

module.exports = model("Nominations", nominationsSchema, "nominations");
