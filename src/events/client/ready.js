module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        client.user.setPresence({ activities: [{ name: '/help' }] })
        console.log(`${client.user.tag} is logged on!`);
    }
}