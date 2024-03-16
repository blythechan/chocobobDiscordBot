const { Schema, model } = require('mongoose');

const nominationsSchema = new Schema({
    _id:                Schema.Types.ObjectId,
    guildId:            String,
    memberId:           String,
    member:             { type: Object, required: true },
    nominating:         { type: Object, required: true },
    nominatingRank:     String,
    nominatingRankId:   String,
    expires:            new Date()
}, {
    timestamps:         true
});

module.exports = model("nominations", nominationsSchema, "nominations");

// Retrieve nominations by user
nominationsSchema.statics.retrieveNominaitons = (guildId, memberId, onlyExpired) => {
    if(onlyExpired === true) {
        return this.findOne({ guildId: guildId, memberId: memberId, expires: { $lte: new Date() } });
    } else {
        return this.findOne({ guildId: guildId, memberId: memberId, expires: { $$gte: new Date() } });
    }
}