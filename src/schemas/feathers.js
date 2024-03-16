const { Schema, model } = require('mongoose');

const feathersSchema = new Schema({
    _id:                Schema.Types.ObjectId,
    guildId:            String,
    memberId:           String,
    member:             { type: Object, required: true },
    lastCategory:       String,
    totalFeathers:      Number,
    lastSender:         String
}, {
    timestamps:         true
});

module.exports = model("feathers", feathersSchema, "feathers");

/**
 * Retrieve feathers by a specific user in the server
 * @param {String} guildId Obtains the server's identifier
 * @param {String} member Obtainers the user id that is receiving feathers
 */
feathersSchema.statics.findFeathersByGuildMember = (guildId, member) => {
    return this.find({ }).where({ guildId: guildId, memberId: member.id });
}

/**
 * Check if user exists and update their feathers, otherwise create the user
 * @param {String} guildId Obtains the server's identifier
 * @param {Array} member Obtainers the user(s) that is receiving feathers
 * @param {Number} featherCount Obtains the amount of feathers
 * @param {String} sender Obtains the sending user's id
 * @param {String} category Obtains the reason for gifting of feathers
 */
feathersSchema.statics.giveFeathersByGuildMember = (guildId, member, featherCount, sender, category) => {
    if(!member.isArray) {
        console.error(`Member must be an array of strings.`);
        return false;
    }
    (member || []).map(user => {
        // Check if user already has existing feathers
        const existingUserFeathers = this.findOne({ guildId: guildId, memberId: user.id });

        // User exists and has feathers
        if(existingUserFeathers) {
            this.updateOne({ guildId: guildId, memberId: user }, { $set: { lastCategory: category, "totalFeathers": "$totalFeathers" + featherCount, sender: sender } });
        } else { // User does not exist, create a document for them
            this.insertOne({ 
                guildId:        guildId,
                memberId:       user.id,
                member:         user,
                lastCategory:   category,
                totalFeathers:  featherCount,
                lastSender:     sender
            });
        }
    });
    return true;
}