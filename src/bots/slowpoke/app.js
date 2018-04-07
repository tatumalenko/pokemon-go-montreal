// Import the discord.js module
const Discord = require('discord.js');
const pd = require('./assets/modules/pokedex');
const configs = require('../../../configs/configs');
const Utils = require('../../utils/Utils');

const validCmds = ['pd', 'dex', 'slowpoke', 'sp'];

// Create an instance of a Discord client
const client = new Discord.Client({ fetchAllMembers: true });

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
    console.log('-----------------------------------------------------------------');
    console.log(`${client.user.tag}, Ready to serve ${client.guilds.size} guilds and ${client.users.size} users`);
    console.log('-----------------------------------------------------------------');
});

// Create an event listener for command messages
client.on('message', async (message) => {
    try {
        const dco = { // Discord Context Object
            client,
            guild: message.guild,
            channel: message.channel,
            member: message.member,
            msg: {
                content: message.content,
                cmd: message.content.startsWith('!') ? message.content.substring(1).split(' ')[0] : false,
                args: message.content
                    .substring(1)
                    .split(' ')
                    .splice(1)
                    .map(e => e.trim())
                    .filter(e => e !== ''),
            },
        };
        // await dco.channel.send(dco.msg.args);

        if (!(dco.channel.name === configs.channels.botTesting || dco.channel.name === configs.channels.pokedex || dco.channel.name === configs.channels.adminMods)) return;

        // Our bot needs to know if it will execute a command
        // It will listen for messages that will start with `!`
        if (dco.msg.cmd) { // Not a falsy value (undefined, null, 0 etc)
            if (dco.msg.cmd === 'server') {
                if (!message.member.roles.some(role => role.name === 'admin' || role.name === 'mod' || role.name === 'mega-bot')) {
                    await message.channel.send('You do not have permission for this command! You n\'avez pas la permissions d\'utiliser cette commande!');
                    return;
                }
                let args = message.content.substring(1).split(' ');
                args = args.splice(1);
                // '!server restart slowpoke'
                if (args.length === 2 && (args[0].toLowerCase() === 'restart') && (args[1].toLowerCase() === process.env.name)) {
                    await message.channel.send('Got it! Restarting now...');
                    process.exit(1);
                }
                return;
            }
            if (!validCmds.includes(dco.msg.cmd.toLowerCase())) return; // Not the 'pd' command

            if (dco.msg.args.length === 0 || dco.msg.args.join(' ').toLowerCase().includes('help')) {
                await dco.channel.send({
                    embed: {
                        description: '**Slowpoke bot here!** `These are some of the cool things you can ask me to tell you about.`\n' +
                            '\n**Basic commands**:' +
                            '\n**`\'!pd <name>\'`**: \n       `will display Pokemon stat and moveset info for Pokemon <name> at level 39 and for perfect IVs`' +
                            '\n**`\'!pd <move>\'`**: \n       `will display some basic stats for Move name <move>`\n'

                            +
                            '\n**Advanced commands**:' +
                            '\n**`\'!pd <name> level <num>\'`**: \n          `will display all CP combos possible for IV > 90% of Pokemon <name> at level <num>`' +
                            '\n**`\'!pd <name> cp <num>\'`**: \n          `will display all IV combos possible for cp = num & level 20`' +
                            '\n**`\'!pd <name> cp <num1> level <num2>\'`**: \n          `will display all IV combos possible for cp <num1> & level <num2>`' +
                            '\n**`\'!pd <name> iv <num1>/<num2>/<num3> level <num4>\'`**: \n          `will display CP & other stat info for Pokemon <name> at level <num4> with IV values in <atk>/<def>/<sta> format`'

                            +
                            '\n\n** Note**: `Here are what the emojis seen when I report a full Pokemon spec card represent.`' +
                            '\n**`Next to each Pokemon\'s fast or charge move`**: \n          `(`<:power1:385003640622153728>`:Power|`<:lightning1:385004007669891072>`:Energy|`<:stopwatch1:385003619302506498>`:Duration[secs])`' +
                            '\n**`Next to each Pokemon\'s fast/charge moveset`**: \n          `(`<:swords1:385001990268125184>` Offensive Perfection| `<:shield1:385001970391318538>` Defensive Perfection)`'

                            +
                            '\n\n`Offensive and Defensive Perfection represent the \% approaching value to that of the best moveset (i.e. normalized) ' +
                            'for either they\'re better at attacking (Offensive) or defending (Defensive). In other words, 100\% is the best and the lower is the worst.`' +
                            '\n\n`For more details on how the values were calculated and see some examples, type` **`\'!pd help more\'`** ',
                    },
                });
                return;
            } else if (dco.msg.args.join(' ').toLowerCase().includes('help more')) {
                await dco.channel.send({
                    embed: {
                        description: '\n**Basic examples**: ' +
                            '\n`\'!pd entei\' `' +
                            '\n`\'!pd dazzling gleam\' `\n'

                            +
                            '\n**Advanced examples**:' +
                            '\n`\'!pd entei level 20\' `' +
                            '\n`\'!pd entei cp 1913\' `' +
                            '\n`\'!pd entei cp 2972 level 32\' `' +
                            '\n`\'!pd entei iv 12/14/13 level 30\' `' +
                            '\n\n`The formulas used to rank the movesets are somewhat complicated. The approach ' +
                            'used is well described in this spreadsheet found` [here](https://www.reddit.com/r/TheSilphRoad/comments/5v0svt/updated_pok%C3%A9mon_go_species_data_and_moveset/).' +
                            '\n\n`You might notice some discrepencies (especially for the Defensive Perfection values) from other sources such as PokeGenie. This is expected is ' +
                            'no single method for determining the \'best\' stats/movesets given all the assumptions when not knowing exactly who is the defender. ' +
                            'These are just rough guidelines and are subjective.`',
                    },
                });
                return;
            }

            if (dco.msg.args[0].toLowerCase().includes('cost')) {
                const lvs = [];
                for (let i = 1; i < 41; i += 0.5) { lvs.push(i); }

                console.log(dco.msg.args[1], dco.msg.args[2]);
                console.log(`dco.msg.args.length !== 3: ${dco.msg.args.length !== 3}`);
                console.log(`!isFinite(dco.msg.args[1]) || !isFinite(dco.msg.args[2]): ${!Number.isFinite(Number(dco.msg.args[1]))}` || !Number.isFinite(Number(dco.msg.args[2])));
                console.log(`=> 1, <= 40, lv? ${dco.msg.args[1] < 1 || dco.msg.args[1] > 40 ||
                    dco.msg.args[2] < 1 || dco.msg.args[2] > 40 ||
                    !lvs.some(lv => [dco.msg.args[1], dco.msg.args[2]].some(arg => lv !== arg))}`);
                console.log(`dco.msg.args[1] >= dco.msg.args[2]: ${dco.msg.args[1] >= dco.msg.args[2]}`);


                if (dco.msg.args.length !== 3) return;


                if (!Number.isFinite(Number(dco.msg.args[1])) || !Number.isFinite(Number(dco.msg.args[2]))) return;


                if (dco.msg.args[1] < 1 || dco.msg.args[1] > 40 ||
                    dco.msg.args[2] < 1 || dco.msg.args[2] > 40 ||
                    !lvs.some(lv => [dco.msg.args[1], dco.msg.args[2]].some(arg => lv !== arg))) return;


                if (parseFloat(dco.msg.args[1]) >= parseFloat(dco.msg.args[2])) return;


                const cost = pd.powerUpCost(parseFloat(dco.msg.args[1]), parseFloat(dco.msg.args[2]));

                await dco.channel.send({
                    embed: {
                        title: 'Level Up Costs',
                        description: `**Start**: \`${dco.msg.args[1]}\`\n` +
                            `**End**: \`${dco.msg.args[2]}\`\n` +
                            `<:stardust:383911374532902912>: \`${cost.stardust.toLocaleString('en')}\`\n` +
                            `<:rarecandy:383911406434516994>: \`${cost.candies}\``,
                    },
                });
                return;
            }


            if (pd.isMoveName(dco.msg.args.join(' '))) { // args[0] = moveName
                await dco.channel.send({
                    embed: pd.moveInfo(new pd.Move({
                        name: dco.msg.args.join(' '),
                    })),
                });
                return;
            }

            let pkmnName;
            // console.log(db.isValidFilter([dco.msg.args[0], dco.msg.args[1]].join(' ')));
            if (Utils.isValidFilter([dco.msg.args[0], dco.msg.args[1]].join(' '))) {
                const otherArgs = [];
                for (let i = 2; i < dco.msg.args.length; i += 1) { otherArgs.push(dco.msg.args[i]); }

                pkmnName = [dco.msg.args[0], dco.msg.args[1]].join(' ').toLowerCase();
                dco.msg.args = [pkmnName, ...otherArgs];
            } else { pkmnName = dco.msg.args[0].toLowerCase(); }

            // Account for annoying multi worded names or those containing weird characters
            switch (pkmnName) {
                case 'ho-oh':
                    pkmnName = 'ho oh';
                    break;

                case 'nidoran♀':
                    pkmnName = 'nidoran female';
                    break;

                case 'nidoran♂':
                    pkmnName = 'nidoran male';
                    break;

                default:
                    pkmnName = Utils.getEnglishName(pkmnName);
                    break;
            }

            // console.log(pd.isPokemonName(pkmnName));
            let pokemonInfo = pd.pokemonInfo(new pd.Pokemon({
                name: pkmnName,
            }));

            if (pd.isPokemonName(pkmnName)) { // args[0] = pokemonName
                if (dco.msg.args.length === 1) { // args.length = 1
                    // await dco.channel.send({
                    //     embed: pd.pokemonInfo(new pd.Pokemon({
                    //         'name': pkmnName
                    //     }))
                    // });
                    await dco.channel.send({
                        embed: pokemonInfo[0],
                    });
                    await dco.channel.send({
                        embed: pokemonInfo[1],
                    });
                    await dco.channel.send({
                        embed: pokemonInfo[2],
                    });
                    return;
                } else if ((dco.msg.args.length - 1) % 2 === 0) { // args[1:end].length IS EVEN
                    let hp;
                    let cp;
                    let level;
                    let iv;

                    for (let i = 1; i < dco.msg.args.length; i += 2) {
                        switch (dco.msg.args[i].toLowerCase()) {
                            case 'hp':
                                // Validate cp value to be numeric and less than 400?
                                if (!(Number.isFinite(Number(dco.msg.args[i + 1])) && dco.msg.args[i + 1] > 0 && dco.msg.args[i + 1] <= 400)) {
                                    return await dco.channel.send('Invalid value for `hp`, please enter a single number between 1 and 400!');
                                }
                                hp = dco.msg.args[i + 1];
                                break;
                            case 'cp':
                                // Validate cp value to be numeric and less than 4000?
                                if (!(Number.isFinite(Number(dco.msg.args[i + 1])) && dco.msg.args[i + 1] > 0 && dco.msg.args[i + 1] <= 6000)) {
                                    return await dco.channel.send('Invalid value for `cp`, please enter a single number between 1 and 6000!');
                                }
                                cp = dco.msg.args[i + 1];
                                break;
                            case 'level':
                                // Validate level value to be numeric and within 1-40?
                                if (!(Number.isFinite(Number(dco.msg.args[i + 1])) && dco.msg.args[i + 1] > 0 && dco.msg.args[i + 1] <= 40)) {
                                    return await dco.channel.send('Invalid value for `level`, please enter a single number between 1 and 40!');
                                }
                                level = dco.msg.args[i + 1];
                                break;
                            case 'iv':
                            {
                                // Parse string formatted as 'atk/def/sta' into {atk: atk, def: def, sta: sta}
                                if (!dco.msg.args[i + 1].includes('/')) {
                                    return await dco.channel.send('Invalid value for `iv`, please enter it in this format: `atk/def/sta`');
                                }
                                const ivArr = dco.msg.args[i + 1].split('/').map(e => Number.parseInt(e, 10));
                                if (!ivArr.every(e => Number.isFinite(Number(e)) && e >= 0)) {
                                    return await dco.channel.send('Invalid value for `iv`, please enter it in this format: `atk/def/sta`');
                                }
                                iv = {
                                    atk: ivArr[0],
                                    def: ivArr[1],
                                    sta: ivArr[2],
                                };
                                break;
                            }
                            default:
                                await dco.channel.send(`${dco.msg.args[i]} is not a valid command. Try \`cp\`, \`level\`, or \`iv\`, followed by a space and its value.`);
                                return;
                        }
                    }

                    // Change the conditional such that we can also have iv sent in with level to get cp value of Pokemon
                    if (!level) {
                        if (cp && iv) level = 0;
                        else level = 20;
                    }

                    // console.log(cp, hp);
                    if (iv) {
                        pokemonInfo = pd.pokemonInfo(new pd.Pokemon({
                            name: pkmnName,
                            cp,
                            level,
                            iv,
                        }));
                        await dco.channel.send({
                            embed: pokemonInfo[0],
                        });
                        await dco.channel.send({
                            embed: pokemonInfo[1],
                        });
                        await dco.channel.send({
                            embed: pokemonInfo[2],
                        });
                    } else if (cp && hp) {
                        await dco.channel.send({ // Call statInfo2
                            embed: pd.statInfo2({
                                name: pkmnName,
                                cp: parseFloat(cp),
                                hp: parseFloat(hp),
                            }),
                        });
                    } else {
                        await dco.channel.send({ // Call statInfo
                            embed: pd.statInfo(new pd.Pokemon({
                                name: pkmnName,
                                cp: cp || 0,
                                level: level || 20,
                            })),
                        });
                    }
                    return;
                } // args[1:end].length is ODD
                await dco.channel.send(`Invalid number of commands after \`!pd ${dco.msg.args[0]}\`. An even number of commands should follow Pokemon's name (e.g. \`!pd entei cp 1930\`).`);
                return;
            }
            await dco.channel.send('Invalid Pokemon or Move name! Type `!pd help` for help!');
            return;
        }
    } catch (e) {
        if (e.toString().includes('Must be 2048 or fewer in length.')) {
            await message.channel.send('Too many combinations possible. Refine search. Trop de combinaisons possible. Rafinez votre requête.');
        }
        console.error(e);
        if (e.message) { await message.guild.channels.find('name', 'bot-logs').send(e.message); }
    }
});

// Log our bot in
client.login(configs.slowpoke.botToken);

