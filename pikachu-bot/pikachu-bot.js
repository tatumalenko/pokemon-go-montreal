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

// Import botutils module
const bu = require('../assets/modules/botutils');

// Import database utility functions module
const db = require('../assets/modules/dbutils');

// Import localization dictionary module json object
const dict = require('../assets/modules/dictionary').dict();

/**---------------------------------------------------------------------------------------------
 * CREATE IMPORTANT CONSTANTS TO BE REUSED ON NEARLY EVERY EVENT
 *--------------------------------------------------------------------------------------------*/
const neighbourhoodNames = db.getNeighbourhoods();

const client = new Discord.Client({
    fetchAllMembers: true // Required in order for bot to cache ALL members (otherwise only up to 250 members might be cached)
}); // Create an instance of a Discord client

/**---------------------------------------------------------------------------------------------
 * EVENT: READY
 *--------------------------------------------------------------------------------------------*/
client.on('ready', () => {
    console.log('-----------------------------------------------------------------');
    console.log('I am ready!');
    console.log('-----------------------------------------------------------------');
});

/**---------------------------------------------------------------------------------------------
 * EVENT: GUILD MEMBER ADD
 *--------------------------------------------------------------------------------------------*/
client.on('guildMemberAdd', async(member) => {
    await db.addMember(member);
    console.log('New member added to database: ' + member.displayName);
});

/**---------------------------------------------------------------------------------------------
 * EVENT: GUILD MEMBER REMOVE
 *--------------------------------------------------------------------------------------------*/
client.on('guildMemberRemove', async(member) => {
    await db.removeMember(member);
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
            await message.channel.send(new Discord.Attachment('https://github.com/tatumalenko/pikachu-bot/raw/master/assets/media/want-1.gif', 'want-1.gif'));
        } else if (message.content.substring(0, 1) == '!') {
            let args = message.content.substring(1).split(' ');
            let cmd = args[0];

            args = args.splice(1).map(e => e.trim()).filter(e => e !== '');

            switch (cmd) {
                case 'db':
                    if (!bu.hasRole(message.member, 'admin')) return;

                    switch (args[0]) {
                        case 'get-memberids':
                            {
                                console.log(await db.getMemberIds());
                                break;
                            }
                        case 'get-filters':
                            {
                                const mf = await db.getFilters(message.member.id);
                                console.log(mf);
                                break;
                            }
                        case 'add-filter':
                            {
                                try {
                                    await db.addFilter(message.member.id, 'pikachU');
                                } catch (e) {
                                    console.log(e);
                                }
                                break;
                            }
                        case 'remove-filter':
                            {
                                try {
                                    await db.removeFilter(message.member.id, 'pikachU');
                                } catch (e) {
                                    console.log(e);
                                }
                                break;
                            }
                        case 'has-filter':
                            {
                                console.log(await db.hasFilter('359066772126826497', 'snorlax'));
                                break;
                            }
                        case 'has-every-filter':
                            {
                                console.log(await db.hasEveryFilter('210950208421494797', ['snorlax', 'laval']));
                                console.log(await db.hasEveryFilter('210950208421494797', ['snorlax', 'ville-marie']));
                                break;
                            }
                        case 'get-filtered-members':
                            {
                                const ctx = {
                                    name: 'snorlax',
                                    neighbourhood: 'ville-marie',
                                    iv: '72%',
                                    cp: '1340',
                                    level: '23'
                                };

                                console.log(await db.getFilteredMembers(message.guild.members, ctx));
                                break;
                            }
                        case 'insert-all':
                            await db.createTableFromRoles(message.guild.members.array());
                            break;
                    }
                    break;

                case 'neighbourhoods':
                    if (!bu.hasRole(message.member, 'admin')) return;
                    await message.channel.send(neighbourhoodNames);
                    break;

                case 'meowth':
                    {
                        if (!bu.hasRole(message.member, 'admin')) return;
                        const meowthChannelNames = ['raids-post'].concat(neighbourhoodNames).filter(e => e !== 'laval' && e !== 'wilds-post');
                        await message.channel.send(meowthChannelNames.join(', '));
                        await message.channel.send(meowthChannelNames.map(() => 'Montreal Canada').join(', '));
                        break;
                    }
                case 'translate':
                case 'traduit':
                    await message.channel.send(db.getTranslation(args.join(' ')));
                    break;
                case 'want':
                case 'veux':
                    if (message.channel.name !== 'bot-testing' && message.channel.name !== 'wants-post')
                        return;

                    // !want or !veux
                    if (!args.length) {
                        let mf = await db.getFilters(null, message.member.id);

                        if (cmd === 'veux')
                            mf.pokemon = mf.pokemon.map(e => db.getTranslation(e));

                        await message.channel.send('__**Current alerts/Alertes actuelles**__\n ' +
                            '**Pokemon**: \n`{' + (mf.pokemon ? mf.pokemon : ' . ') + '}` ' +
                            '\n**Neighbourhood(s)/quartier(s)**: \n`{' + (mf.neighbourhood ? mf.neighbourhood : ' ') + '}`');
                        return;
                    }

                    switch (args.join(' ').toLowerCase()) {
                        case 'everywhere':
                        case 'partout':
                            await db.setFilters(message.member.id, 'neighbourhood', neighbourhoodNames);
                            message.react('✅');
                            break;
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
                            if (args.length > 1) {
                                cmd === 'want' ?
                                    await message.channel.send(dict.WANT_MULTIPLE_COMMAND_ERROR()) :
                                    await message.channel.send(dict.VEUX_ERREUR_COMMANDES_MULTIPLES());
                                return;
                            }
                            args.forEach(async(arg) => {
                                try {
                                    //arg = arg.replace('’', '\'');
                                    await db.addFilter(message.member.id, arg);
                                    await message.react('✅');
                                } catch (e) {
                                    await message.react('❌');
                                    await message.channel.send(e);
                                }
                            });
                            break;
                    }
                    break;

                case 'unwant':
                case 'veuxpas':
                    if (message.channel.name !== 'bot-testing' && message.channel.name !== 'wants-post')
                        return;

                    switch (args.join(' ').toLowerCase()) {
                        case 'everywhere':
                        case 'partout':
                            await db.setFilters(message.member.id, 'neighbourhood', []);
                            await message.react('✅');
                            break;
                        case 'all':
                        case 'tous':
                            await db.setFilters(message.member.id, 'pokemon', []);
                            await message.react('✅');
                            break;
                        default:
                            if (args.length > 1) {
                                await message.channel.send('Please only send one Pokemon or neighbourhood name per \'!want\' command.');
                                return;
                            }
                            args.forEach(async(arg) => {
                                try {
                                    await db.removeFilter(message.member.id, arg);
                                    await message.react('✅');
                                } catch (e) {
                                    await message.react('❌');
                                    await message.channel.send(e);
                                }
                            });
                            break;
                    }
                    break;
            }
        } else if (message.channel.name === 'discord-income') {
            bu.findPointInPolygon({
                client,
                message,
                spawn: bu.createSpawn(message)
            });
        } else {
            // Message does not start with '!' nor does it originates from the 'tweet-income' channel
        }
    } catch (e) {
        console.log(e);
    }
});

// Login bot
client.login(auth.token);