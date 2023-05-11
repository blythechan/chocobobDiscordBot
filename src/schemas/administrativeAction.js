const { Schema, model } = require('mongoose');

const administrativeActionSchema = new Schema({
    _id: Schema.Types.ObjectId,
    guildId: String,
    member: { type: Object, required: true },
    command: String,
    outcome: String,
    actionTakenOn: String,
});

module.exports = model("AdministrativeAction", administrativeActionSchema, "administrativeAction");

administrativeActionSchema.statics.findLogsByGuild = (guildId) => {
    return this.find({ }).where({ guildId: guildId }).sort({ _id: -1 }).limit(50);
}

administrativeActionSchema.statics.findLogsByGuildMember = (guildId, memberId) => {
    return this.find({ }).where({ guildId: guildId, memberId: { id: memberId } }).sort({ _id: -1 }).limit(50);
}

administrativeActionSchema.statics.removeLogsByGuild = (guildId) => {
    return this.deleteMany({ guildId: guildId });
}