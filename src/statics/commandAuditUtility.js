const CommandAudit = require('../schemas/commandAudit');
const keepAuditAlive = ["givefeathers", "nominate"];

CommandAudit.retrieveCommandAudit = async function (guildId, command, latest) {
    if(!guildId || !command) {
        console.error(`Invalid request.`);
        return false;
    }
    if(latest) {
        return await this.findOne({ guildId: guildId, command: command }).sort({ createdAt: -1 }).limit(1);
    } else {
        return await this.findOne({ guildId: guildId, command: command }).sort({ createdAt: -1 });
    }
}

CommandAudit.createAudit = async function(guildId, memberId, command, details) {
    if(!guildId || !command) {
        console.error(`Invalid request.`);
        return false;
    }
    if(keepAuditAlive.includes(keepAuditAlive)) {
        const isWithinCooldown = checkCooldown(guildID, memberId, command);
        if(isWithinCooldown === false) {
            this.deleteOne({ command: command, guildId: guildId, memberId: memberId });
        } else {
            return false;
        }
    }
    const newAudit = new CommandAudit({
        command: command,
        guildId: guildId,
        memberId: memberId,
        content: details || ""
    });
    await newAudit.save();
    return true;
}

/**
 * Check if a command was made within a sepcific cooldown period
 * @param {String} guildId Obtains the server's identifier
 * @param {String} memberId Obtains a server member's identifier
 * @param {String} command Obtains the user's last command
 */
CommandAudit.checkCooldown = async function (guildId, memberId, command, cooldown) {
    if(!guildId || !command || !cooldown) {
        console.error(`Invalid request, missing parameter.`);
        return false;
    }
    const lastCommand = await this.findOne({ guildId: guildId, memberId: memberId, command: command  }).sort({ createdAt: -1 });
    // Check command's timestamp
    if(lastCommand && lastCommand.createdAt) {
        switch(cooldown) {
            case "5 minutes":
                return passed5MinuteCooldown(lastCommand.createdAt);
            default:
                return passed12HourCooldown(lastCommand.createdAt);
        }
    } else { // There is no record, proceed
        return true;
    }
}

/**
 * Determine if a date is less than or equal to 12 hours
 * @param {Date} dateTime Obtains the date time as recorded on the document
 * @returns Boolean
 */
function passed12HourCooldown(dateTime) {
    const inputDate = new Date(dateTime);
    const currentDate = new Date();
    const twelveHoursAgo = new Date(currentDate);
    twelveHoursAgo.setHours(currentDate.getHours() - 12);  
    return inputDate < twelveHoursAgo;
}

/**
 * Determine if a date is less than or equal to 5 minutes
 * @param {Date} dateTime Obtains the date time as recorded on the document
 * @returns Boolean
 */
function passed5MinuteCooldown(dateTime) {
    const inputDate = new Date(dateTime);
    const currentDate = new Date();
    const twelveHoursAgo = new Date(currentDate);
    twelveHoursAgo.setHours(currentDate.getMinutes() - 5);  
    return inputDate < twelveHoursAgo;
}

module.exports = CommandAudit;