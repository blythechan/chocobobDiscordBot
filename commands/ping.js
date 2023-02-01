module.exports = {
    name: 'ping',
    description: "Check latency between client and bot.",
    args: false,
    alias: ['pong', 'ping'],
    execute(message, args){
        if(message.content === "&ping") {
            message.channel.send(`:ping_pong: Pong`);
        } else  {
            message.channel.send('Ping :ping_pong:');
        }
    }
}