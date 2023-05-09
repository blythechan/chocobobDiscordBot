module.exports = (client) => {
    client.pickPresence = async () => {
        
        const options = [
            {
                type: 	ActivityType.Playing,
                text: 	"/help",
                status:	"online"
            }, 
            {
                type: 	ActivityType.Listening,
                text: 	"/help",
                status:	"online"
            }, 
            {
                type: 	ActivityType.Watching,
                text: 	"/help",
                status:	"online"
            }, 
        ];

        const option = Match.floor(Math.random() * options.length);
        
       client.user.setPresence({
            activities: [{
                name: options[option].text,
                type: options[option].type
            }],
            status: options[option].status
        });
    };
};