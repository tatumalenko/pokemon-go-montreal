/**---------------------------------------------------------------------------------------------
 * pikachu-bot.js 
 *--------------------------------------------------------------------------------------------*/
process.on('unhandledRejection', console.error); // Nodejs config to better trace unhandled promise rejections

/**---------------------------------------------------------------------------------------------
 * IMPORT MODULES
 *--------------------------------------------------------------------------------------------*/
// Import the discord.js module
const Discord = require('discord.js');
const auth = require('./auth.json');

// Import utility classes
const MU = require('../assets/modules/mongoutils');
const mongoutils = new MU.MongoUtils();
const GU = require('../assets/modules/geoutils');
const geoutils = new GU.GeoUtils();
const SU = require('../assets/modules/spawnutils');
const spawnutils = new SU.SpawnUtils();
const DiscU = require('../assets/modules/discordutils');
const discordutils = new DiscU.DiscordUtils();
const DictU = require('../assets/modules/dictutils');
const dictutils = new DictU.DictUtils();

// Import localization dictionary module json object
const dict = require('../assets/modules/dictionary').dict();

/**---------------------------------------------------------------------------------------------
 * CREATE IMPORTANT CONSTANTS TO BE REUSED ON NEARLY EVERY EVENT
 *--------------------------------------------------------------------------------------------*/
const neighbourhoodNames = dictutils.getNeighbourhoodNamesArray();

const client = new Discord.Client({
    fetchAllMembers: true // Required in order for bot to cache ALL members (otherwise only up to 250 members might be cached)
}); // Create an instance of a Discord client

/**---------------------------------------------------------------------------------------------
 * EVENT: READY
 *--------------------------------------------------------------------------------------------*/
client.on('ready', async() => {
    console.log('-----------------------------------------------------------------');
    console.log('I am ready!');
    console.log('-----------------------------------------------------------------');
});

/**---------------------------------------------------------------------------------------------
 * EVENT: GUILD MEMBER ADD
 *--------------------------------------------------------------------------------------------*/
client.on('guildMemberAdd', async(member) => {
    await mongoutils.addMember(member);
    console.log('New member added to database: ' + member.displayName);
});

/**---------------------------------------------------------------------------------------------
 * EVENT: GUILD MEMBER REMOVE
 *--------------------------------------------------------------------------------------------*/
client.on('guildMemberRemove', async(member) => {
    await mongoutils.removeMember(member);
    console.log('Member removed from database: ' + member.displayName);
});

/**---------------------------------------------------------------------------------------------
 * EVENT: MESSAGE
 *--------------------------------------------------------------------------------------------*/
// Create an event listener for command messages
client.on('message', async(message) => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    try {
        if (message.content === '<@360755167953682432>') {
            await message.channel.send({
                embed: {
                    title: 'Pika-chu!',
                    description: dict.PIKACHU_COMMANDS()
                }
            });
            await message.channel.send(new Discord.Attachment('https://github.com/tatumalenko/discord-assets/raw/master/pikachu-bot/media/want-1.gif', 'want-1.gif'));
        } else if (message.content.substring(0, 1) == '!') {
            let args = message.content.substring(1).split(' ');
            let cmd = args[0];

            args = args.splice(1).map(e => e.trim()).filter(e => e !== '');

            switch (cmd) {
                case 'neighbourhoods':
                case 'quartiers':
                    await message.channel.send('**Neighbourhoods/Quartiers: ** ' + dictutils.getNeighbourhoodNamesArray().sort().join(', '));
                    break;
                case 'location':
                case 'locations':
                    // e.g.: '!location' or '!locations'
                    if (!args.length) {
                        await message.channel.send('**' + message.member.displayName + ' Location(s): ** ' + await mongoutils.getDefaultNeighbourhood(message.member.id));
                        return;
                    }

                    // e.g.: '!location plateau, ville-marie'
                    try {
                        await mongoutils.setDefaultNeighbourhood({
                            memberId: message.member.id,
                            args: args.join(' ').toLowerCase()
                        });
                        await message.react('✅');
                    } catch (e) {
                        await message.react('❌');
                        await message.channel.send(e);
                    }
                    break;
                case 'checkwant':
                    if (!discordutils.hasRole(message.member, 'admin')) return;
                    await message.channel.send('`' + await mongoutils.createFiltersString(message.guild.members.find('displayName', args[0])) + '`');
                    break;
                case 'meowth':
                    {
                        if (!discordutils.hasRole(message.member, 'admin')) return;
                        const meowthChannelNames = ['raids-post'].concat(neighbourhoodNames).filter(e => e !== 'laval' && e !== 'wilds-post');
                        await message.channel.send(meowthChannelNames.join(', '));
                        await message.channel.send(meowthChannelNames.map(() => 'Montreal Canada').join(', '));
                        break;
                    }
                case 'translate':
                case 'traduit':
                    await message.channel.send(dictutils.getTranslation(args.join(' ')));
                    break;
                case 'want':
                case 'veux':
                    if (message.channel.name !== 'bot-testing' && message.channel.name !== 'test-zone')
                        return;

                    // '!want' or '!veux'
                    if (!args.length) {
                        await message.channel.send(await mongoutils.createFiltersString(message.member));
                        return;
                    }

                    // '!want on' or '!want off'
                    if (['on', 'off'].includes(args.join('').toLowerCase())) {
                        try {
                            await mongoutils.setStatus({
                                memberId: message.member.id,
                                arg: args.join('').toLowerCase()
                            });
                            await message.react('✅');
                        } catch (e) {
                            await message.react('❌');
                            await message.channel.send(e);
                        }
                        return;
                    }

                    switch (args.join(' ').toLowerCase()) {
                        case 'help':
                            await message.channel.send({
                                embed: {
                                    description: dict.WANT_HELP()
                                }
                            });
                            break;
                        case 'aide':
                            await message.channel.send({
                                embed: {
                                    description: dict.VEUX_AIDE()
                                }
                            });
                            break;
                        case 'help more':
                            await message.channel.send({
                                embed: {
                                    description: dict.WANT_HELP_MORE() +
                                        '`' + neighbourhoodNames.join('\n') + '`'
                                }
                            });
                            break;
                        case 'aide plus':
                            await message.channel.send({
                                embed: {
                                    description: dict.VEUX_AIDE_PLUS() +
                                        '`' + neighbourhoodNames.join('\n') + '`'
                                }
                            });
                            break;
                        default:
                            try {
                                const filters = await mongoutils.createQueryFilterArrayFromMessage({
                                    memberId: message.member.id,
                                    cmd: cmd,
                                    args: args.join(' ').toLowerCase()
                                });

                                for (const filter of filters)
                                    await mongoutils.addFilter({
                                        memberId: message.member.id,
                                        filter: filter
                                    });
                                await message.react('✅');
                            } catch (e) {
                                await message.react('❌');
                                await message.channel.send(e);
                            }
                            break;
                    }
                    break;

                case 'unwant':
                case 'veuxpas':
                    if (message.channel.name !== 'bot-testing' && message.channel.name !== 'test-zone')
                        return;

                    try {
                        if (args.join(' ').toLowerCase() === 'everything') {
                            await mongoutils.clearFilters(message.member.id);
                        } else {
                            const filters = await mongoutils.createQueryFilterArrayFromMessage({
                                memberId: message.member.id,
                                cmd: cmd,
                                args: args.join(' ').toLowerCase()
                            });

                            for (const filter of filters)
                                await mongoutils.removeFilter({
                                    memberId: message.member.id,
                                    filter: filter
                                });
                        }
                        await message.react('✅');
                    } catch (err) {
                        await message.react('❌');
                        await message.channel.send(err);
                    }
                    break;
            }
        } else if (message.channel.name === 'wilds-income') {
            let spawn = spawnutils.createSpawn(message);

            const spawnNeighbourhood = await geoutils.findPointInPolygon(spawn.coordinates);

            spawn = {
                neighbourhood: spawnNeighbourhood,
                ...spawn
            };

            const embed = spawnutils.createSpawnEmbed({
                spawn,
                client
            }); // embed = {content, embed}, it's weird, I know..

            const recipients = await spawnutils.getDiscordRecipientsArray({
                spawn,
                client
            });

            // await discordutils.sendEmbedToRepicients([client.guilds.get('352462877845749762').members.find('displayName', 'uphillsimplex')], embed);
            await discordutils.sendEmbedToRepicients(recipients, embed); // Post in DM channel to members
            await discordutils.sendEmbedToRepicients([message.guild.channels.find('name', 'wilds-post')], embed); // Post in wilds-post channel
        } else {
            // Message does not start with '!' nor does it originates from wilds-income
        }
    } catch (err) {
        console.log(err.stack);
    }
});

// Login bot
client.login(auth.token);