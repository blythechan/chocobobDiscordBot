const { Schema, model } = require('mongoose');

const commandAuditSchema = new Schema({
    guildId:            String,
    memberId:           String,
    command:            String
}, {
    timestamps:         true
});

module.exports = model("CommandAudit", commandAuditSchema, "commandAudit");
