
const HeadpatCounter = require('../schemas/headpatCounter');
const defaults = require('../functions/tools/defaults.json');

/**
 * Update the user's headpat counter
 * @param {String} memberId Obtains the requesting member's identifier
 * @param {String} headpatCategory Obtains and determines which type of headpat to update
 */
HeadpatCounter.giveHeadpats = async function (memberId, headpatCategory) {
    if(memberId === defaults.BOT_ID || headpatCategory === "bot") {
        return await this.findOneAndUpdate({ memberId: memberId }, { $inc: { "headpats": 1, "botHeadpats": 1 } }, { new: true, upsert: true } );
    }
    return await this.findOneAndUpdate({ memberId: memberId }, { $inc: { "headpats": 1 } }, { new: true, upsert: true } );
}

module.exports = HeadpatCounter;