// Import the discord.js module
const Discord = require('discord.js');
const pd = require('./pokedex.js');
const auth = require('./auth.json');

// Create an instance of a Discord client
const client = new Discord.Client();

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
    console.log('I am ready!');
});

// Create an event listener for command messages
client.on('message', (message) => {
    try {
        // Our bot needs to know if it will execute a command
        // It will listen for messages that will start with `!`
        if (message.content.substring(0, 1) == '!') {
            var args = message.content.substring(1).split(' ');
            var cmd = args[0];

            args = args.splice(1);
            switch (cmd) {
                case 'pd':
                    if(message.channel.name === "pokedex") {
                        const embed = pd.embed(args.join(" "));
                        
                        //console.log(embed);
                        if (embed) {
                            message.channel.send({ embed });
                        } else {
                            message.channel.send("Invalid Pokemon or Move name!");
                        }
                        break;
                    }
            }
        }
    } catch (e) {
        console.log(e);
    }
});

// Log our bot in
client.login(auth.token);