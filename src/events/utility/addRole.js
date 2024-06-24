const defaults = require("../../functions/tools/defaults.json");

/**
 * Determines the role to provide during auto-assign
 * @param {Object} serverFeathers Obtains the server information
 * @param {Object} featherDocument Obtains the user's feathers
 * @param {String} recentFeatherCat Obtains the current feather category that is being assigned
 */
function checkFeathersLimit(serverFeathers, featherDocument, recentFeatherCat) {
  const featherCats = [];
  const featherRoles = [];
  const newFeatherRoles = [];
  const featherLimits = [];

  serverFeathers.featherRoles.forEach((featherData) => {
    // Store the type of feather (category)
    featherCats.push(featherData.cat);
    featherRoles.push(featherData.role); // stores list array of roles
    featherLimits.push(featherData.limit); // stores the list array of limits
    newFeatherRoles.push(featherData.roles);
  });

  // Shorthands of user's feathers
  const combat = featherDocument.cat_combat;
  const crafting = featherDocument.cat_crafting;
  const gathering = featherDocument.cat_gathering;
  const leadership = featherDocument.cat_leadership;
  const dedication = featherDocument.cat_dedication;
  const chaos = featherDocument.cat_chaos;
  const generosity = featherDocument.cat_generosity;

  let roleName = "";
  switch (recentFeatherCat) {
    case featherCats[0]: // Combat
        roleName = getHighestRole(combat, featherLimits[0], featherRoles[0]);
      break;
    case featherCats[1]: // Crafting
        roleName = getHighestRole(crafting, featherLimits[1], featherRoles[1]);
      break;
    case featherCats[2]: // Chaos
        roleName = getHighestRole(chaos, featherLimits[2], featherRoles[2]);
      break;
    case featherCats[3]: // Dedication
        roleName = getHighestRole(dedication, featherLimits[3], featherRoles[3]);
      break;
    case featherCats[4]: // Gathering
        roleName = getHighestRole(gathering, featherLimits[4], featherRoles[4]);
      break;
    case featherCats[5]: // Generosity
        roleName = getHighestRole(generosity, featherLimits[5], featherRoles[5]);
      break;
    default: // Leadership
        roleName = getHighestRole(leadership, featherLimits[6], featherRoles[6]);
      break;
  }

  if (roleName === "") {
    return false;
  } else {
    return roleName;
  }
}

/**
 * @param { Number } limit Obtains the user's highest count of feathers for a specific category
 * @param { Object } roles Obtains the server's feather's roles
 * @returns The highest role's role name
 */
function getHighestRole(userLimit, limits, roles) {
  let role = false;

  for (let i = 0; i < limits.length; i++) {
    if (userLimit >= limits[i]) {
      role = roles[i];
    } else {
      break; // No need to check further if the limit is exceeded
    }
  }
  return role;
}

module.exports = { checkFeathersLimit };
