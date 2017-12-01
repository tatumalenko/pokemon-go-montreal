// Import the discord.js module
const Discord = require('discord.js');
const auth = require('./auth.json');

// Create an instance of a Discord client
const client = new Discord.Client();

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
    console.log('I am ready!');
});

// Create an event listener for new guild members
client.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find('name', 'general');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome to Pokemon GO Montreal, ${member}! I'm Professor Willow and will be your guide! Tag me (type @Professor Willow) if ever you want some help or tips!`);
});

client.on('guildMemberRemove', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find('name', 'secret-treehouse');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Gee-Golly. ${member} has left us. 😢`);
});

client.on('channelCreate', channel => {
    //console.log(channel); 
});

// Create an event listener for command messages
client.on('message', (message) => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    try {
        // if (message.channel.name == 'bot-testing' /*message.member.id  == '350677679957213190'*/ ) {
        //     if (message.content.includes('<@210950208421494797>')) {
        //         //message.edit(message.content.split('<@210950208421494797>').filter(e => e != '<@210950208421494797>').filter(e => e != ''));
        //         message.channel.send('Nice try, ' + message.member + '!');
        //     }

        // }

        if (message.content === '<@380373659493335042>') {
            message.channel.send({
                embed: {
                    description: '**Professor Willow here!** Ready to help!\n\n'

                        +
                        'To get some cool wild spawn alerts for specific Pokemon within the neighbourhoods you choose, head over to '

                        +
                        message.guild.channels.find('name', 'wants-post')

                        +
                        ' and let ' + message.guild.members.find('id', '360755167953682432') + ' assist you by typing `\'!want help\'` there!\n\n'

                        +
                        'To get some info and stats on Pokemon including IVs, ATK/DEF/STA, and much more, head over to '

                        +
                        message.guild.channels.find('name', 'pokedex')

                        +
                        ' and let ' + message.guild.members.find('id', '359610082457288706') + ' assist you by typing `\'!pd help\'` there!\n\n'

                        +
                        'For any other questions or help, don\'t be shy to ask one of the admin or mod staff, they would be delighted to answer any questions!'
                }
            });

        } else if (message.content.substring(0, 1) == '!') {
            var args = message.content.substring(1).split(' ');
            var cmd = args[0];

            args = args.splice(1);
            switch (cmd) {
                case 'count':
                    if (message.channel.name === 'secret-treehouse') {
                        if (args[0] === undefined) {
                            message.channel.send("There are **" + message.guild.memberCount + "** members currently onboard!");
                        } else if (args[0] === "days" && args[1] !== undefined) {
                            const guild = message.guild;
                            let newMembers = 0;
                            const days = args[1];
                            const daysMs = days * 24 * 60 * 60 * 1000;
                            const hours = days * 24;

                            const curDate = new Date();
                            const curDateMs = curDate.getTime();

                            const compareDateMs = curDateMs - daysMs;

                            guild.members.forEach(function (guildMember, guildMemberId) {
                                let joinedDateMs = guildMember.joinedTimestamp;

                                if (joinedDateMs > compareDateMs) {
                                    newMembers = newMembers + 1;
                                }
                            })

                            message.channel.send("There are **" + newMembers + "** new members in the past " + days + " day(s)/" + hours + " hours!");
                        }
                    }
                    break;
                case 'clear':

                    // Check the following permissions before deleting messages:
                    //    1. Check if the user has enough permissions
                    //    2. Check if I have the permission to execute the command
                    if (!message.channel.permissionsFor(message.author).has("MANAGE_MESSAGES")) {
                        message.channel.sendMessage("Sorry, you don't have the permission to execute the command \"" + message.content + "\"");
                        console.log("Sorry, you don't have the permission to execute the command \"" + message.content + "\"");
                        return;
                    } else if (!message.channel.permissionsFor(client.user).has("MANAGE_MESSAGES")) {
                        message.channel.sendMessage("Sorry, I don't have the permission to execute the command \"" + message.content + "\"");
                        console.log("Sorry, I don't have the permission to execute the command \"" + message.content + "\"");
                        return;
                    }

                    // Only delete messages if the channel type is TextChannel
                    // DO NOT delete messages in DM Channel or Group DM Channel
                    if (message.channel.type == 'text') {
                        message.channel.fetchMessages()
                            .then(messages => {
                                if (args[0] !== undefined) {
                                    message.channel.bulkDelete(parseInt(args[0]) + 1);
                                } else {
                                    message.channel.send("You need to enter a number following the `!clear` command to indicate how many messages to delete!\n" +
                                        "Example: `!clear 2`");
                                }
                            })
                            .catch(err => {
                                console.log('Error while doing Bulk Delete');
                                console.log(err);
                            })
                    }
                    break;
            }
        } else {}
    } catch (e) {
        console.log(e);
    }
});

// Log our bot in
client.login(auth.token);