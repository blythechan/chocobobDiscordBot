const defaults = require('../../functions/tools/defaults.json');

function checkFeathersLimit(serverFeathers, featherDocument, recentFeatherCat) {
    const featherCats = [];
    const featherRoles = [];
    const featherLimits = [];

    serverFeathers.featherRoles.map(cat => {
        featherCats.push(cat.cat);
        featherRoles.push(cat.role);
        featherLimits.push(cat.limit);
    });

    const combat = featherDocument.cat_combat;
    const crafting = featherDocument.cat_crafting;
    const gathering = featherDocument.cat_gathering;
    const leadership = featherDocument.cat_leadership;
    const dedication = featherDocument.cat_dedication;
    const chaos = featherDocument.cat_chaos;
    const generosity = featherDocument.cat_generosity;

    let roleName = "";
    switch(recentFeatherCat) {
        case featherCats[0]: // Combat
            if(combat && combat >= featherLimits[0]) {
                roleName = featherRoles[0];
            }
            break;
        case featherCats[1]: // Crafting
            if(crafting && crafting >= featherLimits[1]) {
                roleName = featherRoles[1];
            }
            break;
        case featherCats[2]: // Chaos
            if(gathering && gathering >= featherLimits[2]) {
                roleName = featherRoles[2];
            }
            break;
        case featherCats[3]: // Dedication
            if(leadership && leadership >= featherLimits[3]) {
                roleName = featherRoles[3];
            }
            break;
        case featherCats[4]: // Gathering
            if(dedication && dedication >= featherLimits[4]) {
                roleName = featherRoles[4];
            }
            break;
        case featherCats[5]: // Generosity
            if(chaos && chaos >= featherLimits[5]) {
                roleName = featherRoles[5];
            }
            break;
       default: // Leadership
            if(generosity && generosity >= featherLimits[6]) {
                roleName = featherRoles[6];
            }
            break;
    }

    if(roleName === "") {
        return false;
    } else {
        return roleName;
    }
}

module.exports = { checkFeathersLimit };