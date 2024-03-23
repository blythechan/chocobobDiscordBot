const { EmbedBuilder } = require('discord.js');
const defaults = require('../tools/defaults.json');

/**
 * Create an embed.
 * All parameters are optional
 * @param {String} title
 * @param {String} url 
 * @param {String} description 
 * @param {String} thumbnail 
 * @param {Array} fields 
 * @param {String} image 
 * @param {String} footer 
 */
export async function customEmbedBuilder(title, thumbnail, description, fields, footer, url, image) {
    const embed = new EmbedBuilder()
        .setColor(defaults.COLOR);
    
    if(title) {
        embed.setTitle(title);
    }

    if(description) {    
        embed.setDescription(description);
    }

    if(url) {
        embed.setURL(url);
    }

    if(thumbnail) {
        embed.thumbnail(thumbnail);
    }

    if(image) {
        embed.setImage(image);
    }

    if(fields) {
        fields.map(field => {
            embed.addFields(field);
        });
    }

    if(footer) {
        embed.setFooter(footer);
    }

    return embed;
}