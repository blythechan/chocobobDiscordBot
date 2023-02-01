module.exports = {
    name: 'headpats',
    description: "Praise Chocobob with a head pat.",
    args: false,
    alias: ['headpat', 'headpats'],
    execute(message, args){
        if (message.content === "&headpats" || message.content === "&headpat")
            message.channel.send(`T-Thank you, kweh~ :pleading_face::heart:`);
        
    }
}