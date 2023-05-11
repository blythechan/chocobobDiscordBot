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