// Import the discord.js module
const Discord = require('discord.js');
const auth = require('./auth.json');

// Create an instance of a Discord client
const client = new Discord.Client();
const DiscordUtils = require('../assets/modules/DiscordUtils');

const discordutils = new DiscordUtils();

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
    console.log('I am ready!');
});

// Create an event listener for new guild members
client.on('guildMemberAdd', (member) => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find('name', 'welcome');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome to Pokémon GO Montréal, ${member
    }! I'm Professor Willow and will be your guide! Tag me (type @Professor Willow) if ever you want some help or tips! ` +
        'Set your team by typing `!team <team>` where `<team>` is either `valor`, `instinct`, or `mystic`.');
});

client.on('guildMemberRemove', (member) => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find('name', 'secret-treehouse');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Gee-Golly. ${member.displayName} has left us.  😢`);
});

// client.on('channelCreate', (channel) => {
//     // console.log(channel);
// });

// Create an event listener for command messages
client.on('message', async (message) => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    try {
        if (message.content === '<@380373659493335042>') {
            await message.channel.send({
                embed: {
                    description: `${'**Professor Willow here!** Ready to help!\n\n' +
                        'To get some cool wild spawn alerts for specific Pokemon within the neighbourhoods you choose, head over to '}${
                        message.guild.channels.find('name', 'wants-post')
                    } and let ${message.guild.members.find('id', '360755167953682432')} assist you by typing \`'!want help'\` there!\n\n` +
                        `To get some info and stats on Pokemon including IVs, ATK/DEF/STA, and much more, head over to ${
                            message.guild.channels.find('name', 'pokedex')
                        } and let ${message.guild.members.find('id', '359610082457288706')} assist you by typing \`'!pd help'\` there!\n\n` +
                        'For any other questions or help, don\'t be shy to ask one of the admin or mod staff, they would be delighted to answer any questions!',
                },
            });
        } else if (message.content.substring(0, 1) === '!') {
            let args = message.content.substring(1).split(' ');
            const cmd = args[0];
            args = args.splice(1);
            const arg = args.join(' ').toLowerCase();

            switch (cmd.toLowerCase()) {
                case 'team': {
                    if (message.channel.name !== 'welcome' && message.channel.name !== 'bot-testing') return;

                    const validTeamNames = ['valor', 'instinct', 'mystic'];
                    if (!validTeamNames.includes(arg)) return;
                    const requestedTeamName = validTeamNames[validTeamNames.indexOf(arg)];

                    for (const teamName of validTeamNames) {
                        if (discordutils.hasRole(message.member, teamName)) {
                            await message.channel.send(`You already have a team role, ${message.member}`);
                            return;
                        }
                    }

                    const teamRole = message.guild.roles.find('name', requestedTeamName);
                    try {
                        await message.member.addRole(teamRole);
                        message.channel.send(`Got it! Added ${message.member} to Team ${requestedTeamName.charAt(0).toUpperCase()}${requestedTeamName.slice(1)}`);
                    } catch (e) {
                        console.log(e);
                    }
                }
                    break;
                case 'announcement':
                {
                    if (message.channel.name !== 'secret-treehouse' && message.channel.name !== 'bot-logs' && message.channel.name !== 'announcements-post') return;
                    if (!message.channel.permissionsFor(message.author).has('ADMINISTRATOR')) return;

                    args = args.join(' ').split(' | ');
                    const embed = {};
                    let channelDestination;
                    for (let i = 0; i < args.length - 1; i += 2) {
                        switch (args[i]) {
                            case 'channel':
                                channelDestination = message.guild.channels.find('name', args[i + 1]);
                                break;
                            case 'msg':
                                embed.description = args[i + 1].replace(/\\n/g, '\n');
                                break;
                            case 'title':
                                embed.title = args[i + 1];
                                break;
                            case 'url':
                                embed.url = args[i + 1];
                                break;
                            case 'image':
                                embed.image = {
                                    url: args[i + 1],
                                };
                                break;
                            default:
                                break;
                        }
                    }

                    embed.color = '15588666';
                    if (!channelDestination) channelDestination = message.channel;

                    console.log(embed);

                    await channelDestination.send({
                        embed,
                    });

                    break;
                }
                case 'count':
                    if (message.channel.name === 'secret-treehouse' || message.channel.name === 'bot-testing') {
                        if (args[0] === undefined) {
                            message.channel.send(`There are **${message.guild.memberCount}** members currently onboard!`);
                        } else if (args[0] === 'days' && args[1] !== undefined) {
                            const { guild } = message;
                            let newMembers = 0;
                            const days = args[1];
                            const daysMs = days * 24 * 60 * 60 * 1000;
                            const hours = days * 24;

                            const curDate = new Date();
                            const curDateMs = curDate.getTime();

                            const compareDateMs = curDateMs - daysMs;

                            guild.members.forEach((guildMember) => {
                                const joinedDateMs = guildMember.joinedTimestamp;

                                if (joinedDateMs > compareDateMs) {
                                    newMembers += 1;
                                }
                            });

                            message.channel.send(`There are **${newMembers}** new members in the past ${days} day(s)/${hours} hours!`);
                        }
                    }
                    break;
                case 'clear':
                    // Check the following permissions before deleting messages:
                    //    1. Check if the user has enough permissions
                    //    2. Check if I have the permission to execute the command
                    if (!message.channel.permissionsFor(message.author).has('MANAGE_MESSAGES')) {
                        message.channel.sendMessage(`Sorry, you don't have the permission to execute the command "${message.content}"`);
                        console.log(`Sorry, you don't have the permission to execute the command "${message.content}"`);
                        return;
                    } else if (!message.channel.permissionsFor(client.user).has('MANAGE_MESSAGES')) {
                        message.channel.sendMessage(`Sorry, I don't have the permission to execute the command "${message.content}"`);
                        console.log(`Sorry, I don't have the permission to execute the command "${message.content}"`);
                        return;
                    }

                    // Only delete messages if the channel type is TextChannel
                    // DO NOT delete messages in DM Channel or Group DM Channel
                    if (message.channel.type == 'text') {
                        message.channel.fetchMessages()
                            .then((messages) => {
                                if (args[0] !== undefined) {
                                    message.channel.bulkDelete(parseInt(args[0], 10) + 1);
                                } else {
                                    message.channel.send('You need to enter a number following the `!clear` command to indicate how many messages to delete!\n' +
                                        'Example: `!clear 2`');
                                }
                            })
                            .catch((err) => {
                                console.log('Error while doing Bulk Delete');
                                console.log(err);
                            });
                    }
                    break;
                default:
                    break;
            }
        } else { return; }
    } catch (e) {
        console.log(e);
    }
});

// Log our bot in
client.login(auth.token);
