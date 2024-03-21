
const Feathers = require('../schemas/feathers');
const CommandAudit = require('../statics/commandAuditUtility');
const defaults = require('../functions/tools/defaults.json');

/**
 * Retrieve feathers by a specific user in the server
 * @param {String} guildId Obtains the server's identifier
 * @param {String} member Obtainers the user id that is receiving feathers
 */
Feathers.findFeathersByGuildMember = async function (guildId, memberId) {
    if(!guildId || !memberId) {
        console.error(`Invalid request.`);
        return false;
    }
    return await this.findOne({ guildId: guildId, memberId: memberId });
}

/**
 * Check if user exists and update their feathers, otherwise create the user
 * @param {String} guildId Obtains the server's identifier
 * @param {Array} member Obtainers the user(s) that is receiving feathers
 * @param {Number} featherCount Obtains the amount of feathers
 * @param {String} sender Obtains the sending user's id
 * @param {String} category Obtains the reason for gifting of feathers
 */
Feathers.giveFeathersByGuildMember = async function (guildId, member, featherCount, sender, category) {
    if(!guildId) {
        console.error(`Invalid request.`);
        return false;
    }

    if(!Array.isArray(member)) {
        console.error(`Members must be an array.`);
        return false;
    } else {
        let catValue = "";
        const category_choice = defaults.FEATHER_CATEGORIES.find(obj => { return Object.keys(obj)[0] === category; });
        if(category_choice) {
            catValue = Object.values(category_choice)[0];
        } else {
            console.error(`Invalid category choice.`);
            return false;
        }
        (member || []).map( async (user) => {
            // Check if user already has existing feathers
            const existingUserFeathers = await this.findOne({ guildId: guildId, memberId: user });

            // User exists and has feathers
            if(existingUserFeathers && existingUserFeathers !== null) {
                await this.updateOne({ guildId: guildId, memberId: user }, { $inc: { "totalFeathers": 1, [catValue]: 1} }, { $set: { lastCategory: category, sender: sender } });
            } else { // User does not exist, create a document for them
                const newFeatheredUser = new Feathers({ 
                    guildId:        guildId,
                    memberId:       user,
                    lastCategory:   category,
                    totalFeathers:  featherCount,
                    lastSender:     sender
                });

                newFeatheredUser[catValue] = featherCount;

                await newFeatheredUser.save();
            }
        });
        CommandAudit.createAudit(guildId, sender, "givefeathers");
    }
    return true;
}

module.exports = Feathers;