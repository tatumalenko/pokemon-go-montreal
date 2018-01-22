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
            const user = await this.client.userRepository.fetchUser(msg.author);

            // '!want' or '!veux'
            if (args.length === 0) {
                await msg.channel.send(this.createWildPreferenceString(user));
                return;
            }

            // '!want on' or '!want off'
            if (['on', 'off'].includes(args.join(''))) {
                try {
                    if (user.preferences.wild.status !== args.join('')) {
                        user.preferences.wild.status = args.join('');
                    }
                    user.save();
                    await msg.react('✅');
                } catch (e) {
                    await msg.react('❌');
                    await msg.channel.send(e);
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
        const userLocations = (user.locations && user.locations.length > 1) ? user.locations.join(', ') : 'none set/aucunes établis';

        const strArr = [`**User/Utilisateur:** ${user.name}\n**Status:** ${user.preferences.wild.status}\n**Default Locations Défaults:** ${userLocations}\n**POKEMON | NEIGHBOURHOOD | LV | IV**`];

        user.preferences.wild.pokemons.forEach((pokemon) => {
            strArr.push(`\`${pokemon.name} | ${pokemon.neighbourhoods.join(', ')} | ${pokemon.level} | ${pokemon.iv}\``);
        });

        return strArr.sort().join('\n');
    }
};