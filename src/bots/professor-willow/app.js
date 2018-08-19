// Import the discord.js module
const Discord = require('discord.js');
const TwitterPackage = require('twitter');
const configs = require('../../../configs/configs');


const Twitter = new TwitterPackage(configs['professor-willow']);
const wh = new Discord.WebhookClient(configs['professor-willow'].webhookId, configs['professor-willow'].webhookToken);

const TWITTER_USER_IDS = configs['professor-willow'].userIds;

const colors = ['#7f0000', '#535900', '#40d9ff', '#8c7399', '#d97b6c', '#f2ff40', '#8fb6bf', '#502d59', '#66504d',
    '#89b359', '#00aaff', '#d600e6', '#401100', '#44ff00', '#1a2b33', '#ff00aa', '#ff8c40', '#17330d',
    '#0066bf', '#33001b', '#b39886', '#bfffd0', '#163a59', '#8c235b', '#8c5e00', '#00733d', '#000c59',
    '#ffbfd9', '#4c3300', '#36d98d', '#3d3df2', '#590018', '#f2c200', '#264d40', '#c8bfff', '#f23d6d',
    '#d9c36c', '#2db3aa', '#b380ff', '#ff0022', '#333226', '#005c73', '#7c29a6',
];

// Create an instance of a Discord client
const client = new Discord.Client({
    fetchAllMembers: true,
});

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
    console.log('-----------------------------------------------------------------');
    console.log(`${client.user.tag}, Ready to serve ${client.guilds.size} guilds and ${client.users.size} users`);
    console.log('-----------------------------------------------------------------');
});

// Create an event listener for new guild members
client.on('guildMemberAdd', (member) => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find('name', configs.channels.joinTeam);
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome to Pokémon GO Montréal, ${member
    }! I'm Professor Willow and will be your guide! Tag me (type @Professor Willow) if ever you want some help or tips! `
        + 'Set your team by typing either `!team mystic`, `!team instinct`, or `!team valor`.');
});

client.on('guildMemberRemove', (member) => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find('name', configs.channels.adminMods);
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
        if (message.content === `<@${configs['professor-willow'].clientId}>`) {
            await message.channel.send({
                embed: {
                    description: `${'**Professor Willow here!** Ready to help!\n\n'
                        + 'To get some cool wild spawn alerts for specific Pokemon within the neighbourhoods you choose, head over to '}${
                        message.guild.channels.find('name', 'wants-post')
                    } and let ${message.guild.members.find('id', configs.pikachu.clientId)} assist you by typing \`'!want help'\` there!\n\n`
                        + `To get some info and stats on Pokemon including IVs, ATK/DEF/STA, and much more, head over to ${
                            message.guild.channels.find('name', 'pokedex')
                        } and let ${message.guild.members.find('id', configs.slowpoke.clientId)} assist you by typing \`'!pd help'\` there!\n\n`
                        + 'For any other questions or help, don\'t be shy to ask one of the admin or mod staff, they would be delighted to answer any questions!',
                },
            });
        } else if (['damn', 'fuck', 'jesus'].some(word => message.content.includes(word))) {
            const cussWords = ['tabarbak', 'esti', 'calisse'];
            await message.channel.send(cussWords[Math.floor(Math.random() * cussWords.length)]);
        } else if (message.content.substring(0, 1) === '!') {
            let args = message.content.substring(1).split(' ');
            const cmd = args[0];
            args = args.splice(1);
            const arg = args.join(' ').toLowerCase();

            switch (cmd.toLowerCase()) {
                case 'team': {
                    if (message.channel.name !== configs.channels.joinTeam && message.channel.name !== configs.channels.botTesting) return;

                    const validTeamNames = ['valor', 'instinct', 'mystic'];
                    if (!validTeamNames.includes(arg)) return;
                    const requestedTeamName = validTeamNames[validTeamNames.indexOf(arg)];

                    // eslint-disable-next-line
                    for (const teamName of validTeamNames) {
                        if (hasRole(message.member, teamName)) {
                            await message.channel.send(`You already have a team role, ${message.member}`);
                            return; // Dead-end, return false since nothing triggers ESLINT error
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
                    if (message.channel.name !== configs.channels.adminMods && message.channel.name !== configs.channels.botLogs && message.channel.name !== configs.channels.announcementPost) return;
                    if (!message.channel.permissionsFor(message.author).has('ADMINISTRATOR')) return;

                    args = args.join(' ').split(' | ');
                    const embed = {};
                    let content;
                    let channelDestination;
                    for (let i = 0; i < args.length - 1; i += 2) {
                        switch (args[i]) {
                            case 'content':
                                content = args[i + 1];
                                break;
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

                    if (Object.keys(embed).length !== 0) { embed.color = '15588666'; }

                    if (!channelDestination) channelDestination = message.channel;

                    console.log(content, embed);

                    if (!!content && Object.keys(embed).length !== 0) {
                        await channelDestination.send(content, { embed });
                    } else if (content && Object.keys(embed).length === 0) {
                        await channelDestination.send(content);
                    } else if (!content && Object.keys(embed).length !== 0) {
                        await channelDestination.send({
                            embed,
                        });
                    }
                    break;
                }
                case 'count':
                    if (message.channel.name === configs.channels.adminMods || message.channel.name === configs.channels.botTesting) {
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
                    }

                    if (!message.channel.permissionsFor(client.user).has('MANAGE_MESSAGES')) {
                        message.channel.sendMessage(`Sorry, I don't have the permission to execute the command "${message.content}"`);
                        console.log(`Sorry, I don't have the permission to execute the command "${message.content}"`);
                        return;
                    }

                    // Only delete messages if the channel type is TextChannel
                    // DO NOT delete messages in DM Channel or Group DM Channel
                    if (message.channel.type === 'text') {
                        message.channel.fetchMessages()
                            .then((messages) => {
                                if (args[0] !== undefined) {
                                    message.channel.bulkDelete(parseInt(args[0], 10) + 1);
                                } else {
                                    message.channel.send('You need to enter a number following the `!clear` command to indicate how many messages to delete!\n'
                                        + 'Example: `!clear 2`');
                                }
                            })
                            .catch((err) => {
                                console.log('Error while doing Bulk Delete');
                                console.log(err);
                            });
                    }
                    break;
                case 'echo':
                    if (!message.channel.permissionsFor(message.author).has('ADMINISTRATOR')) return;
                    // message.channel.send(args.map(v => `${eval(v)}\n`));
                    break;
                case 'server':
                    if (!message.member.roles.some(role => role.name === 'admin' || role.name === 'mod' || role.name === 'mega-bot')) {
                        await message.channel.send('You do not have permission for this command! You n\'avez pas la permissions d\'utiliser cette commande!');
                        return;
                    }
                    // '!server restart professor-willow'
                    if (args.length === 2 && (args[0].toLowerCase() === 'restart') && (args[1].toLowerCase() === process.env.name)) {
                        await message.channel.send('Got it! Restarting now...');
                        process.exit(1);
                    } else if (args.length === 2 && (args[0].toLowerCase() === 'restart') && (args[1].toLowerCase() === 'all')) {
                        await message.channel.send('Got it! Restarting now...');
                        await message.channel.send('!server restart pikachu');
                        await message.channel.send('!server restart slowpoke');
                        await message.channel.send('!server restart self');
                        process.exit(1);
                    }
                    break;
                default:
                    break;
            }
        } else { return; }
    } catch (e) {
        console.error(e);
        if (e.message) { await message.guild.channels.find('name', 'bot-logs').send(e.message); }
    }
});

// Log our bot in
client.login(configs['professor-willow'].botToken);

function hasRole(member, roleName) {
    return member.roles.some(role => roleName.toLowerCase() === role.name);
}

Twitter.stream('statuses/filter', {
    follow: TWITTER_USER_IDS.join(', '),
}, (stream) => {
    console.log('-----------------------------------------------------------------');
    console.log('Twitter bot, Ready to serve');
    console.log('-----------------------------------------------------------------');

    stream.on('data', async (tweet) => {
        try {
            if (!TWITTER_USER_IDS.includes(tweet.user.id_str)
                || tweet.retweeted_status
                || tweet.in_reply_to_user_id_str
                || tweet.in_reply_to_status_id_str) return;

            let mediaUrl;
            if (Object.prototype.hasOwnProperty.call(tweet.entities, 'media')) {
                tweet.entities.media.forEach((media) => {
                    if (media.type === 'photo') { mediaUrl = media.media_url; }
                });
            }

            const data = {
                title: 'Click here to see the tweet!',
                description: tweet.text,
                timestamp: new Date(),
                url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, // eslint-disable-next-line
                color: parseInt(colors[(Math.random() * colors.length) | 0].replace('#', ''), 16).toString(10),
                image: {
                    url: mediaUrl,
                },
                author: {
                    name: tweet.user.screen_name,
                    icon_url: tweet.user.profile_image_url,
                },
            };

            const embed = new Discord.RichEmbed(data);

            await wh.send(`${tweet.user.screen_name} Tweeted!`, embed);
        } catch (e) {
            console.error(e);
        }
    });

    stream.on('error', (error) => {
        console.log(error);
    });
});
