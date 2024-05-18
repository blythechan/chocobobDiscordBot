const defaults = require('../../functions/tools/defaults.json');

/**
 * Determines the role to provide during auto-assign
 * @param {Object} serverFeathers Obtains the server information
 * @param {Object} featherDocument Obtains the user's feathers
 * @param {String} recentFeatherCat Obtains the current feather category that is being assigned
 */
function checkFeathersLimit(serverFeathers, featherDocument, recentFeatherCat) {
    const featherCats   = [];
    const featherRoles  = [];
    const featherLimits = [];

    serverFeathers.featherRoles.forEach(cat => {
        // Store the type of feather (category)
        featherCats.push(cat.cat);
    });

    const combat        = featherDocument.cat_combat;
    const crafting      = featherDocument.cat_crafting;
    const gathering     = featherDocument.cat_gathering;
    const leadership    = featherDocument.cat_leadership;
    const dedication    = featherDocument.cat_dedication;
    const chaos         = featherDocument.cat_chaos;
    const generosity    = featherDocument.cat_generosity;


    // TO DO: Determine the user's highest role to apply based on cat's limit
    // Need to capture limit of user's current number of feathers... did that
    // Now determine the highest limit that they're matching

    let roleName = "";
    switch(recentFeatherCat) {
        case featherCats[0]: // Combat
            if(combat && combat >= featherLimits[0]) {
                roleName = getHighestRole(combat, serverFeathers.featherRoles, featherCats[0]);
            }
            break;
        case featherCats[1]: // Crafting
            if(crafting && crafting >= featherLimits[1]) {
                roleName = getHighestRole(crafting, serverFeathers.featherRoles, featherCats[1]);
            }
            break;
        case featherCats[2]: // Chaos
            if(chaos && chaos >= featherLimits[2]) {
                roleName = getHighestRole(chaos, serverFeathers.featherRoles, featherCats[2]);
            }
            break;
        case featherCats[3]: // Dedication
            if( dedication&& dedication >= featherLimits[3]) {
                roleName = getHighestRole(dedication, serverFeathers.featherRoles, featherCats[3]);
            }
            break;
        case featherCats[4]: // Gathering
            if(gathering && gathering >= featherLimits[4]) {
                roleName = getHighestRole(gathering, serverFeathers.featherRoles, featherCats[4]);
            }
            break;
        case featherCats[5]: // Generosity
            if(generosity && generosity >= featherLimits[5]) {
                roleName = getHighestRole(generosity, serverFeathers.featherRoles, featherCats[5]);
            }
            break;
       default:             // Leadership
            if(leadership && leadership >= featherLimits[6]) {
                roleName = getHighestRole(leadership, serverFeathers.featherRoles, featherCats[6]);
            }
            break;
    }

    if(roleName === "") {
        return false;
    } else {
        return roleName;
    }
}

function getHighestRole(limit, roles, roles) {
    let highestRole = "";
    let maxLimit = 0;
    let limits = roles.limit;

    for (let i = 0; i < limits.length; i++) {
        if(limits[i] <= limit) {
            if(limits[i] > maxLimit) {
                maxLimit = limits[i];
                highestRole = roles[i];
            }
        }
    }

    return highestRole;
}

module.exports = { checkFeathersLimit };