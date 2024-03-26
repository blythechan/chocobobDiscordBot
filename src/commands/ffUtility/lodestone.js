const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const lodestoneTopicThumbnails = [
    "https://ffxiv.gamerescape.com/w/images/9/98/Chocobo_Icon_3.png",
    "https://ffxiv.gamerescape.com/w/images/thumb/2/27/Featurequest1_Icon.png/40px-Featurequest1_Icon.png",
    "https://ffxiv.gamerescape.com/w/images/thumb/5/5e/061844_hr1.png/32px-061844_hr1.png",
    "https://ffxiv.gamerescape.com/w/images/thumb/9/91/061840_hr1.png/32px-061840_hr1.png",
    "https://ffxiv.gamerescape.com/w/images/a/a9/061831.png",
    "https://ffxiv.gamerescape.com/w/images/thumb/a/a1/061803.png/32px-061803.png",
    "https://ffxiv.gamerescape.com/w/images/9/90/Player32_Icon.png",
    "https://ffxiv.gamerescape.com/w/images/5/5c/Player23_Icon.png"
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lodestone')
        .setDescription('NA Lodestone news lookups of latest/current. Maintenance lookup assumed.')
        .addStringOption(option => option.setName(`lookup`).setDescription(`What type of Lodestone news are you interested in?`).setAutocomplete(true)),
    async autocomplete(interaction, client) {
        const focusedValue = interaction.options.getFocused();
        const choices = ["Lodestone Updates", "Status", "Maintenance", "Notices"];
        const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
        await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
    },
    async execute(interaction, client) {
        const requestOptions_limit = {
            method: 'GET',
            timeout: 0,
            limit: 1
        };
        const choice = interaction.options.getString('lookup')
            ? interaction.options.getString('lookup').toLowerCase().replace(" ", "")
            : "maintenance";

        switch (choice) {
            case 'lodestoneupdates':
                const response_updates = await fetch(`https://na.lodestonenews.com/news/updates?limit=1`, requestOptions_limit)
                    .then(response => response.text())
                    .catch(error => console.log('error', error));
                const lsu_res = JSON.parse(response_updates);

                let lsu_embed = new EmbedBuilder();
                lsu_res.forEach(body => {
                    if (body) {
                        lsu_embed
                            .setTitle(`[Lodestone Update] ${body.title}`)
                            .setURL(body.url)
                            .setDescription(`Lodestone Update posted ${formatDateTime(body.time)} (PST)`)
                            .setThumbnail(lodestoneTopicThumbnails[6]);
                    }
                });
                return interaction.reply({
                    content: `Retrieving current or latest FFXIV Status...`,
                    embeds: [lsu_embed],
                });
            case 'status':
                const response_status = await fetch(`https://na.lodestonenews.com/news/status?limit=1`, requestOptions_limit)
                    .then(response => response.text())
                    .catch(error => console.log('error', error));
                const status_res = JSON.parse(response_status);

                let status_embed = new EmbedBuilder();
                status_res.forEach(body => {
                    if (body) {
                        status_embed
                            .setTitle(`[Status] ${body.title}`)
                            .setURL(body.url)
                            .setDescription(`Status posted ${formatDateTime(body.time)} (PST)`)
                            .setThumbnail(lodestoneTopicThumbnails[5]);
                    }
                });
                return interaction.reply({
                    content: `Retrieving current or latest FFXIV Status...`,
                    embeds: [status_embed],
                });
            case 'maintenance':
                const response_maintenance = await fetch(`https://na.lodestonenews.com/news/maintenance?limit=1`, requestOptions_limit)
                    .then(response => response.text())
                    .catch(error => console.log('error', error));
                const res = JSON.parse(response_maintenance);
                let maintenance_embed = new EmbedBuilder();
                const body = res && res.length > 0 ? res[0] : undefined;
                if (body) {
                    const timespanThresh = handleTimespanDiff(body.start, body.end);
                    const active = timespanThresh
                        ? "Current"
                        : body.active
                            ? "Planned"
                            : "Finished";
                    maintenance_embed
                        .setTitle(`[Maintenance] ${body.title}`)
                        .setURL(body.url)
                        .setDescription(`Maintenance posted ${formatDateTime(body.time)} (PST)`)
                        .setThumbnail(lodestoneTopicThumbnails[6])
                        .addFields(
                            { name: 'Countdown', value: `${timespanThresh ? timespanThresh : `Finished`}` },
                            { name: 'Timespan', value: `${formatDateTime(body.start)} (PST) to ${formatDateTime(body.end)} (PST)` },
                            { name: ' ', value: ' ' },
                            { name: 'Status', value: `${active}` }
                        );
                } else {
                    maintenance_embed
                        .setTitle(`[Maintenance]`)
                        .setURL(`https://na.lodestonenews.com/news/maintenance?limit=1`)
                        .setDescription(`No maintenance to report.`)
                        .setThumbnail(lodestoneTopicThumbnails[6]);
                }
                return interaction.reply({
                    content: `Retrieving current or latest FFXIV Maintenance...`,
                    embeds: [maintenance_embed],
                });
            case 'notices':
                const response_notices = await fetch(`https://na.lodestonenews.com/news/notices?limit=1`, requestOptions_limit)
                    .then(response => response.text())
                    .catch(error => console.log('error', error));
                const notice_res = JSON.parse(response_notices);
                let notice_embed = new EmbedBuilder();
                notice_res.forEach(body => {
                    if (body) {
                        notice_embed
                            .setTitle(`[Notice] ${body.title}`)
                            .setURL(body.url)
                            .setDescription(`Notice posted ${formatDateTime(body.time)} (PST)`)
                            .setThumbnail(lodestoneTopicThumbnails[7]);
                    }
                });
                return interaction.reply({
                    content: `Retrieving current or latest FFXIV Notice...`,
                    embeds: [notice_embed],
                });
        }
    }
};

function formatDateTime(dirtyDateTime) {
    const dateTimeObject = new Date(dirtyDateTime);
    const pstDate = dateTimeObject.toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    return `${pstDate}`;
}

function handleTimespanDiff(startDT, endDT) {
    const startFormatted = new Date(startDT);
    const endFormatted = new Date(endDT);
    const current = new Date();
    const displayTS = (startFormatted > current && current > endFormatted)
        || (startFormatted < current);
    let finalResult = "";
    if (displayTS) {
        let d = Math.abs(endFormatted - (startFormatted < current ? current : startFormatted)) / 1000;
        let r = {};
        let s = {
            year: 31536000,
            month: 2592000,
            week: 604800, 
            day: 86400,  
            hour: 3600,
            minute: 60,
            second: 1
        };

        Object.keys(s).forEach(function (key) {
            r[key] = Math.floor(d / s[key]);
            d -= r[key] * s[key];
        });

        if (r.year !== 0) finalResult += `${r.year} years `;
        if (r.month !== 0) finalResult += `${r.month} months `;
        if (r.week !== 0) finalResult += `${r.week} weeks `;
        if (r.day !== 0) finalResult += `${r.day} days `;
        if (r.hour !== 0) finalResult += `${r.hour} hours `;
        if (r.minute !== 0) finalResult += `${r.minute} minutes `;
        if (r.second !== 0) finalResult += `${r.second} seconds `;
        if(current > startFormatted) finalResult = false;
        else finalResult += startFormatted < current ? "till finished" : "from now";
    } else {
        finalResult = false;
    }
    return finalResult;
}