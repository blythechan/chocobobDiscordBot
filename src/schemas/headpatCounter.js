const { Schema, model } = require('mongoose');

const headpatCounterSchema = new Schema({
    memberId:           String,
    botHeadpats:         {
        type: Number,
        default: 1
    },
    headpats:           {
        type: Number,
        default: 1
    }
}, {
    timestamps:         true
});

module.exports = model("HeadpatCounter", headpatCounterSchema, "headpatCounter");