const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const mongoose = require('mongoose');
const XIVAPI = require('@xivapi/js');
const Character = require('../../schemas/character');
const Canvas = require('@napi-rs/canvas');
const xiv = new XIVAPI({
    private_key: process.env.FFXIV_API_KEY,
    language: 'en'
});
const requestOptions_limit = {
    method: 'GET',
    timeout: 0,
};

const applyText = (canvas, text) => {
    const context = canvas.getContext('2d');
    let fontSize = 60;

    do {
        context.font = `${fontSize -= 10}px MingLiU-ExtB`;
    } while (context.measureText(text).width > canvas.width - 200);

    return context.font;
};

const applySubText = (canvas, text) => {
    const context = canvas.getContext('2d');
    let fontSize = 40;

    do {
        context.font = `${fontSize -= 10}px Arial`;
    } while (context.measureText(text).width > canvas.width - 200);

    return context.font;
};

const applyTextColor = (deterFactor) => {
    const value = parseInt(deterFactor);;
    if (value < 50) return "RED";
    else if (value < 60) return "ORANGE";
    else if (value < 70) return "YELLOW";
    else if (value < 80) return "WHITE";
    else if (value <= 90) return "GREEN";
}

const attributeDict = {
    1: "Strength",
    2: "Dexterity",
    3: "Vitality",
    4: "Intelligence",
    5: "Mind",
    6: "Piety",
    7: "HP",
    8: "MP",
    19: "Tenacity",
    20: "Attack Power",
    21: "Defense",
    22: "Spell Speed",
    24: "Magic Defense",
    27: "Critical Hit Rate",
    33: "Attack Magic Potency",
    34: "Healing Magic Potency", 
    44: "Determination",
    45: "Skill Speed",
    46: "Spell Speed"
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whoami')
        .setDescription(`Retrieves a character's data from the Lodestone.`)
        .addStringOption(option => option.setName('charactername').setDescription('If you have more than one character, provide the full name of the character you want to retrieve').setRequired(false))
        .addStringOption(option => option.setName('server').setDescription('Server the character belongs to').setRequired(false))
        .addStringOption(option => option.setName('datacenter').setDescription('Data center that character belongs to').setRequired(false))
        .addBooleanOption(option => option.setName('colorcode').setDescription('Color code class data?').setRequired(false)),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const author = interaction.guild.members.cache.get(interaction.member.id);
            const characterName = interaction.options.getString('charactername');
            const dc = interaction.options.getString('datacenter');
            const server = interaction.options.getString('server');
            const colorcode = interaction.options.getBoolean('colorcode');
            const lodestoneCharacter = characterName
                ? await Character.findOne({ guildId: interaction.guild._id, memberId: author.user.id, characterName: characterName })
                : await Character.findOne({ guildId: interaction.guild._id, memberId: author.user.id });

            let useFFXIVCollect = true;         // Determines if FFXIVCollect API scanned character's data, is set if finalCollect returns 404
            let finalRes        = undefined;    // Stored data from FFXIVAPI
            let finalCollect    = undefined;    // Stored data from FFXIVCollect API

            let characterData   = undefined;    // Stores response from either API
            let characterAC     = undefined;    // Stores Achievements, if public
            let characterMI     = undefined;    // Stores minions, public by default
            let characterMO     = undefined;    // Stores mounts, public by default
            let characterCJ     = undefined;    // Stores class jobs

            if (lodestoneCharacter && !server && !dc) {
                finalRes = await xiv.character.get(lodestoneCharacter.characterId, { data: "AC,FC,MIMO", extended: 1 });
                finalCollect = await fetch(`https://ffxivcollect.com/api/characters/${lodestoneCharacter.characterId}`, requestOptions_limit)
                    .then(response => response.json());
            } else if(characterName && server && dc) {
                const res = await xiv.character.search(characterName, { server: server });
			    finalRes = await xiv.character.get(res.Results[0].ID, { data: "AC,FC,MIMO", extended: 1 });
                finalCollect = await fetch(`https://ffxivcollect.com/api/characters/${finalRes.Character.ID}`, requestOptions_limit)
                    .then(response => response.json());
            // If the request doesn't get sent, catch and fail gracefully.
            } else {
                await interaction.editReply({ content: "Kweh! I could not retrieve your character because it is either not registered with me or the information you provided is incorrect." });
                return; // force return here otherwise catch will eventually be triggered
            }

            // Check if ffxivCollect was able to obtain character data, if failure then switch to lodestone API
            useFFXIVCollect = !finalCollect || (finalCollect.status && finalCollect.status === 404) ? false : true;

            // Store the character's data into one object
            characterData = useFFXIVCollect ? finalCollect : finalRes;
            characterAC = useFFXIVCollect ? finalCollect.achievements.count : finalRes.Achievements.List.length;
            characterCJ = finalRes.Character.ClassJobs.length;
            characterMI = useFFXIVCollect ? finalCollect.minions.count : finalRes.Minions.length;
            characterMO = useFFXIVCollect ? finalCollect.mounts.count : finalRes.Mounts.length;


            // Get totals
            const totalAC = await fetch(`https://xivapi.com/Achievement?limit=1`)
                .then(response => response.json());
            const totalMO = await fetch(`https://xivapi.com/Mount?limit=1`)
                .then(response => response.json());
            const totalMI = await fetch(`https://xivapi.com/Companion?limit=1`)
                .then(response => response.json());
            const totalCJ = 31;  /*await fetch(`https://xivapi.com/ClassJob?limit=1`)
                .then(response => response.json());*/

            const canvas = Canvas.createCanvas(2000, 873);
            const context = canvas.getContext('2d');

            // Backdrop
            context.rect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgba(45, 46, 48, 0.8)";
            context.fill();

            // Character Portrait
            const portrait = await Canvas.loadImage(finalRes.Character.Portrait);
            context.drawImage(portrait, 0, 0, 640, 873);

            // Collections backdrop
            context.beginPath();
            context.fillStyle = "rgba(45, 46, 48, 0.8)";
            context.fillRect(20, 550, 620, 300);
            context.stroke();
            context.closePath();

            // Character text details backdrop
            context.beginPath();
            context.fillStyle = "#131138";
            context.fillRect(640, 0, 1700, 220);
            context.stroke();
            context.closePath();

            // STATS
            context.font = applyText(canvas, "Collections");
            context.fillStyle = 'WHITE';
            context.fillText("Collections", 50, 600);
            const charAC = `Achievements: ${characterAC} / ${totalAC.Pagination.ResultsTotal}`;
            context.font = applySubText(canvas, charAC);
            context.fillStyle = 'WHITE';
            context.fillText(charAC, 50, 640);

            const charJobs = `Class Jobs: ${characterCJ} / 31`;
            context.font = applySubText(canvas, charJobs);
            context.fillStyle = 'WHITE';
            context.fillText(charJobs, 50, 680);

            const charMI = `Minions: ${characterMI} / ${totalMI.Pagination.ResultsTotal}`;
            context.font = applySubText(canvas, charMI);
            context.fillStyle = 'WHITE';
            context.fillText(charMI, 50, 720);

            const charMO = `Mounts: ${characterMO} / ${totalMO.Pagination.ResultsTotal}`;
            context.font = applySubText(canvas, charMO);
            context.fillStyle = 'WHITE';
            context.fillText(charMO, 50, 760);

            // NAME, this too has changed back and forth from FFXIVAPI
            const title = finalRes.Character.Title && finalRes.Character.Title.Name ? finalRes.Character.Title.Name : await fetch(`https://xivapi.com/Title/${finalRes.Character.Title}`, requestOptions_limit)
                .then(response => response.text())
                .catch(error => { return finalRes.Character.Title.Name});
            const charName = `${finalRes.Character.Name} <${title}>`;
            context.font = applySubText(canvas, charName);
            context.fillStyle = 'WHITE';
            context.fillText(charName, 700, 60);

            // ACTIVE CLASS
            const className = finalRes.Character.ActiveClassJob.UnlockedState && finalRes.Character.ActiveClassJob.UnlockedState.Name
                ? finalRes.Character.ActiveClassJob.UnlockedState.Name
                : finalRes.Character.ActiveClassJob.Name;
            var date = new Date(finalRes.Character.ParseDate * 1000).toLocaleDateString("en-US");
            const charClass = `Last seen ${date} as ${className}`;
            context.font = applySubText(canvas, charClass);
            context.fillStyle = 'WHITE';
            context.fillText(charClass, 700, 100);

            // RACE
            // const charRace = `Species: ${finalRes.Character.Race.Name} of ${finalRes.Character.Tribe.Name}`;
            // context.font = applySubText(canvas, charRace);
            // context.fillStyle = 'WHITE';
            // context.fillText(charRace, 700, 140);

            // SERVER
            const charServer = `Server: ${finalRes.Character.Server}, ${finalRes.Character.DC}`;
            context.font = applySubText(canvas, charServer);
            context.fillStyle = 'WHITE';
            context.fillText(charServer, 700, 140);

            // FC
            const charFC = `Free Company: ${finalRes.Character.FreeCompanyName}`;
            context.font = applySubText(canvas, charFC);
            context.fillStyle = 'WHITE';
            context.fillText(charFC, 700, 180);

            // ATTRIBUTES
            if(Object.keys(finalRes.Character.GearSet.Attributes).length > 0) {
                context.font = applyText(canvas, "Attributes");
                context.fillStyle = 'WHITE';
                context.fillText("Attributes", 1290, 280);

                let attrX = 1300;
                let attrY = 280;
                let attribute = 1;
                Object.entries(finalRes.Character.GearSet.Attributes).map(value => {
                    attrX = attrX + 400;
                    if (attribute % 2 === 1) {
                        attrY = attrY + 50;
                        attrX = 1300;
                    }
                    // FFXIVAPI has changed this one me TWICE now... check if name of attr exists
                    if(value[1].Attribute.Name) {
                        const attNum = value[1].Value;
                        const name = value[1].Attribute.Name;
                        const charAtt = `${name.replace(" Potency", "").trim()}: ${attNum}`;
                        context.font = applySubText(canvas, charAtt);
                        context.fillStyle = 'WHITE';
                        context.fillText(charAtt, attrX, attrY);

                    } else {
                        const attId = value[0];
                        const attNum = value[1];
                        const name = attributeDict[attId];
                        const charAtt = `${name.replace(" Potency", "").trim()}: ${attNum}`;
                        context.font = applySubText(canvas, charAtt);
                        context.fillStyle = 'WHITE';
                        context.fillText(charAtt, attrX, attrY);
                    }
                    attribute++;
                })
            }

            // CLASSES
            context.font = applyText(canvas, "Classes");
            context.fillStyle = 'WHITE';
            context.fillText("Classes", 750, 270);

            const charClasses = finalRes.Character.ClassJobs;
            let y = 200;
            let x = 700;
            let placeholder = 1;
            const iconImageRepo = `https://raw.githubusercontent.com/xivapi/classjob-icons/master/icons`;
            for (var i = 0; i <= charClasses.length - 1; i++) {
                const classJob = charClasses[i];
                if (classJob) {
                    let imageURL = iconImageRepo;

                    x = x + 100;
                    if (placeholder % 5 === 1) {
                        y = y + 85;
                        x = 700;
                    }

                    let classState = classJob.UnlockedState && classJob.UnlockedState.Name ? classJob.UnlockedState.Name.toLowerCase() : classJob.Name.substring(0, classJob.Name.indexOf("/"));
                    classState = classState.replace("(limited job)", "").replace(" ", "").trim();
                    imageURL += `/${classState}.png`;
                    const classJobIcon = await Canvas.loadImage(imageURL);
                    context.drawImage(classJobIcon, x + 50, y, 55, 55);

                    const classJobLevel = `${classJob.Level}`;

                    context.font = applySubText(canvas, classJobLevel);
                    context.fillStyle = colorcode ? applyTextColor(classJobLevel) : "WHITE";
                    context.fillText(classJobLevel, x + 57, y + 75);


                    placeholder++;
                }
            }

            const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'selfportrait.png' });
            const dataUsage = useFFXIVCollect ? "Powered by FFXIVCollect and XIVAPI." : "Powered by XIVAPI.";
            await interaction.editReply({ content: `Disclaimer: Data is provided by Lodestone's profiles. If the profile's settings are private, some collections may not be displayed correctly. Click the card to maximize. ${dataUsage}`, files: [attachment] });
        } catch (ex) {
            console.error("Error during character data retrieval:", ex);
            await interaction.editReply({ content: `There was an error while retrieving your character's data!` });
        }
    },
};

