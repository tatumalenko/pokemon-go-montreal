process.on('unhandledRejection', console.error); // Nodejs config to better trace unhandled promise rejections

module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'want',
            enabled: true,
            runIn: [],
            cooldown: 0,
            aliases: ['veux'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            // Ensures if member isnt in repo, they will be
            await this.client.userRepository.addUser(msg.author);

            // Fetch user, with the assurance they are in repo
            const user = await this.client.userRepository.fetchUser(msg.author);

            // '!want' or '!veux'
            if (args.length === 0) {
                await msg.channel.send(this.createWildPreferenceString(user));
                return;
            }

            // '!want on' or '!want off'
            if (['on', 'off'].includes(args.join('').toLowerCase())) {
                try {
                    if (user.preferences.wild.status !== args.join('')) {
                        user.preferences.wild.status = args.join('');
                    }
                    await user.save();
                    await msg.react('✅');
                } catch (e) {
                    await msg.react('❌');
                    await msg.channel.send(e);
                }
                return;
            }

            if (args.length === 2 && (args[0].toLowerCase() === 'id' || args[0].toLowerCase() === 'name')) {
                if (!msg.channel.permissionsFor(msg.author).has('ADMINISTRATOR')) {
                    await msg.channel.send('You do not have permission for this command! You n\'avez pas la permissions d\'utiliser cette commande!');
                    return;
                }
                const requestedDiscordMember = await this.client.guilds.get(this.client.configs.guildId).members.find(args[0].toLowerCase() === 'name' ? 'displayName' : 'id', args[1]);
                if (!requestedDiscordMember) {
                    await msg.channel.send('Could not find user in this server!');
                    return;
                }
                const requestedUser = await this.client.userRepository.fetchUser(requestedDiscordMember);
                await msg.channel.send(this.createWildPreferenceString(requestedUser));
                return;
            }

            // !want blacklist name1 name2 name3
            const blacklistAliases = ['blacklist', 'nowant', 'ignore'];
            if (blacklistAliases.some(alias => args.join(' ').toLowerCase().includes(alias))) {
                try {
                    const blacklist = this.createPokemonNameListFromArgs(user, args.filter(arg => !blacklistAliases.includes(arg.toLowerCase())));
                    user.preferences.wild.blacklist = blacklist;
                    // console.log(user.preferences.wild.blacklist);
                    // console.log(blacklist);
                    await user.save();
                    await msg.react('✅');
                } catch (e) {
                    await msg.react('❌');
                    if (Object.keys(e).includes('errors')) {
                        await msg.channel.send(e.errors['preferences.wild.blacklist'].message);
                    } else {
                        await msg.channel.send(e.message);
                    }
                }
                return;
            }

            // neighbourhoods.length > 1 else assume 'locations' or if empty, 'everywhere',
            const defaultAliases = ['locations', 'mylocations', 'home', 'default', 'favorites'];
            const reqPreferences = this.createQueryFromArgs(args.join(' '));
            reqPreferences.forEach((reqPref) => {
                if ((reqPref.neighbourhoods.length === 1 && reqPref.neighbourhoods.includes(''))
                || defaultAliases.some(defaultAlias => reqPref.neighbourhoods.includes(defaultAlias))) {
                    reqPref.neighbourhoods.pop();
                    if (user.locations && user.locations.length > 0) {
                        reqPref.neighbourhoods.push(...user.locations);
                    } else reqPref.neighbourhoods.push('everywhere');
                }
            });

            user.preferences.wild.pokemons.push(...reqPreferences);

            await user.save();
            await msg.react('✅');
        } catch (e) {
            await msg.react('❌');
            if (Object.keys(e).includes('errors')) {
                await msg.channel.send(e.errors['preferences.wild.pokemons'].message);
            } else {
                await msg.channel.send(e.message);
            }
        }
    }

    /**
     * Return a list (array) of pokemon names that were validated using the
     * `Utils.getEnglishName` function.
     * @param {String} args
     * @return {String[]} list of Pokemon names
     */
    createPokemonNameListFromArgs(user, args) {
        const names = args.map(e => e.toLowerCase());
        const curBlacklist = user.preferences.wild.blacklist;
        return Array.from(new Set([...names, ...curBlacklist].sort()));
    }

    createQueryFromArgs(args) {
        const {
            pokemonNames,
            neighbourhoodNames,
            ivs,
            levels,
        } = this.client.utils.parseWildPreferenceQueryFromArgs(args);

        // Validate pokemonNames.length > 1 else assume 'all',
        // neighbourhoodNames.length > 1 else assume 'everywhere',
        // ivs.length = levels.length = 1
        if (pokemonNames.length < 1) {
            pokemonNames.push('all');
        }

        if (neighbourhoodNames.length === 0) {
            neighbourhoodNames.push('');
        }

        const pokemonFilters = [];

        pokemonNames.forEach((pokemonName) => {
            pokemonFilters.push({
                name: pokemonName,
                neighbourhoods: neighbourhoodNames.sort(),
                iv: ivs[0] ? parseInt(ivs[0], 10) : 0,
                level: levels[0] ? parseInt(levels[0], 10) : 0,
            });
        });

        return pokemonFilters;
    }

    // eslint-disable-next-line class-methods-use-this
    createWildPreferenceString(user) {
        console.log(user.locations);
        const userLocations = (user.locations && user.locations.length >= 1) ? user.locations.join(', ') : 'none set/aucunes établis';

        const strHeader = [`**User/Utilisateur:** ${user.name}\n**Status:** ${user.preferences.wild.status}`];
        strHeader.push(`**Blacklist:** ${user.preferences.wild.blacklist.sort().join(', ')}`);
        strHeader.push(`**Default Locations Défaults:** ${userLocations}\n**POKEMON | NEIGHBOURHOOD | LV | IV**`);

        const strPokemons = [];
        user.preferences.wild.pokemons.forEach((pokemon) => {
            strPokemons.push(`\`${pokemon.name} | ${pokemon.neighbourhoods.join(', ')} | ${pokemon.level} | ${pokemon.iv}\``);
        });

        return [...strHeader, ...strPokemons.sort()].join('\n');
    }
};
