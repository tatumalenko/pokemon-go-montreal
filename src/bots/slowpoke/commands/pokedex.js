const pd = require('../pokedex');
const Utils = require('../../../utils/Utils');

module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'pokedex',
            enabled: true,
            runIn: ['test-zone'],
            cooldown: 0,
            aliases: ['dex', 'pd'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            let pkmnName;
            // console.log(db.isValidFilter([args[0], args[1]].join(' ')));
            console.log(`Args: ${args}`);
            if (Utils.isValidFilter([args[0], args[1]].join(' '))) {
                const otherArgs = [];
                for (let i = 2; i < args.length; i += 1) { otherArgs.push(args[i]); }

                pkmnName = [args[0], args[1]].join(' ').toLowerCase();
                args = [pkmnName, ...otherArgs];
            } else { pkmnName = args[0].toLowerCase(); }

            console.log(`Entered: ${pkmnName}`);
            console.log(`Is Alolan: ${pkmnName.toLowerCase().includes('alola')}`);

            // Account for annoying multi worded names or those containing weird characters
            switch (pkmnName) {
                case 'ho-oh':
                    pkmnName = 'hooh';
                    break;

                case 'hooh':
                    pkmnName = 'hooh';
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
                if (args.length === 1 || (args.length === 1 && pkmnName.includes('alola'))) { // args.length = 1
                    // await msg.channel.send({
                    //     embed: pd.pokemonInfo(new pd.Pokemon({
                    //         'name': pkmnName
                    //     }))
                    // });
                    await msg.channel.send({
                        embed: pokemonInfo[0],
                    });
                    await msg.channel.send({
                        embed: pokemonInfo[1],
                    });
                    await msg.channel.send({
                        embed: pokemonInfo[2],
                    });
                    return;
                }

                if ((args.length - 1) % 2 === 0) { // args[1:end].length IS EVEN
                    let hp;
                    let cp;
                    let level;
                    let iv;

                    for (let i = 1; i < args.length; i += 2) {
                        switch (args[i].toLowerCase()) {
                            case 'hp':
                                // Validate cp value to be numeric and less than 400?
                                if (!(Number.isFinite(Number(args[i + 1])) && args[i + 1] > 0 && args[i + 1] <= 400)) {
                                    return await msg.channel.send('Invalid value for `hp`, please enter a single number between 1 and 400!');
                                }
                                hp = args[i + 1];
                                break;
                            case 'cp':
                                // Validate cp value to be numeric and less than 4000?
                                if (!(Number.isFinite(Number(args[i + 1])) && args[i + 1] > 0 && args[i + 1] <= 6000)) {
                                    return await msg.channel.send('Invalid value for `cp`, please enter a single number between 1 and 6000!');
                                }
                                cp = args[i + 1];
                                break;
                            case 'level':
                                // Validate level value to be numeric and within 1-40?
                                if (!(Number.isFinite(Number(args[i + 1])) && args[i + 1] > 0 && args[i + 1] <= 40)) {
                                    return await msg.channel.send('Invalid value for `level`, please enter a single number between 1 and 40!');
                                }
                                level = args[i + 1];
                                break;
                            case 'iv':
                            {
                                // Parse string formatted as 'atk/def/sta' into {atk: atk, def: def, sta: sta}
                                if (!args[i + 1].includes('/')) {
                                    return await msg.channel.send('Invalid value for `iv`, please enter it in this format: `atk/def/sta`');
                                }
                                const ivArr = args[i + 1].split('/').map(e => Number.parseInt(e, 10));
                                if (!ivArr.every(e => Number.isFinite(Number(e)) && e >= 0)) {
                                    return await msg.channel.send('Invalid value for `iv`, please enter it in this format: `atk/def/sta`');
                                }
                                iv = {
                                    atk: ivArr[0],
                                    def: ivArr[1],
                                    sta: ivArr[2],
                                };
                                break;
                            }
                            default:
                                await msg.channel.send(`${args[i]} is not a valid command. Try \`cp\`, \`level\`, or \`iv\`, followed by a space and its value.`);
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
                        await msg.channel.send({
                            embed: pokemonInfo[0],
                        });
                        await msg.channel.send({
                            embed: pokemonInfo[1],
                        });
                        await msg.channel.send({
                            embed: pokemonInfo[2],
                        });
                    } else if (cp && hp) {
                        await msg.channel.send({ // Call statInfo2
                            embed: pd.statInfo2({
                                name: pkmnName,
                                cp: parseFloat(cp),
                                hp: parseFloat(hp),
                            }),
                        });
                    } else {
                        await msg.channel.send({ // Call statInfo
                            embed: pd.statInfo(new pd.Pokemon({
                                name: pkmnName,
                                cp: cp || 0,
                                level: level || 20,
                            })),
                        });
                    }
                    return;
                } // args[1:end].length is ODD
                await msg.channel.send(`Invalid number of commands after \`!pd ${args[0]}\`. An even number of commands should follow Pokemon's name (e.g. \`!pd entei cp 1930\`).`);
                return;
            }
            await msg.channel.send('Invalid Pokemon or Move name! Type `!pd help` for help!');
            return;
        } catch (e) {
            console.error(`${process.env.name}.${this.name}: \n${e}`);
            if (e.message) {
                if (e.toString().includes('Must be 2048 or fewer in length.')) {
                    await msg.channel.send('Too many combinations possible. Refine search. Trop de combinaisons possible. Rafinez votre requête.');
                } else {
                    await msg.channel.send(`${process.env.name}.${this.name}: ${e.message}`);
                }
                await msg.guild.channels.find('name', this.client.configs.channels.botLogs).send(`${process.env.name}.${this.name}: ${e.message}`);
            }
        }
    }
};
