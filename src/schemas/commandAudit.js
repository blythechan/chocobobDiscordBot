const { Schema, model } = require('mongoose');

const commandAuditSchema = new Schema({
    _id:                Schema.Types.ObjectId,
    guildId:            String,
    memberId:           String,
    member:             { type: Object, required: true },
    command:            String
}, {
    timestamps:         true
});

module.exports = model("commandAudit", commandAuditSchema, "commandAudit");
