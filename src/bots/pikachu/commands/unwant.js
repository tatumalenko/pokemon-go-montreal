module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'unwant',
            enabled: true,
            runIn: [],
            aliases: ['veuxpas'],
            description: '',
        });
    }

    // eslint-disable-next-line class-methods-use-this
    async run(msg, { prefix, cmd, args }) {
        try {
            const defaultAliases = ['locations', 'mylocations', 'home', 'default', 'favorites'];
            const reqPreferences = this.createQueryFromArgs(args.join(' '));

            reqPreferences.forEach(async (prefPkmn) => {
                console.log(prefPkmn);
                if (prefPkmn.neighbourhoods && defaultAliases.some(defaultAlias => prefPkmn.neighbourhoods.includes(defaultAlias))) {
                    const user = await this.client.userRepository.fetchUser(msg.author);
                    prefPkmn.neighbourhoods = (user.locations && user.locations.length > 0) ? user.locations : ['everywhere'];
                }
                const res = await this.client.userRepository.pullFromUser(msg.author, {
                    'preferences.wild.pokemons': prefPkmn,
                });
            });

            // const user = await this.client.userRepository.fetchUser(msg.author);

            // const found = [];
            // const newPrefs = [];
            // reqPreferences.forEach((prefPkmn) => {
            //     found.push(...user.preferences.wild.pokemons.filter((pokemon) => {
            //         if (prefPkmn.name && prefPkmn.name !== pokemon.name) { return false; }
            //         if (prefPkmn.iv && prefPkmn.iv !== pokemon.iv) { return false; }
            //         if (prefPkmn.level && prefPkmn.level !== pokemon.level) { return false; }
            //         if (prefPkmn.neighbourhoods && prefPkmn.neighbourhoods.some(n => pokemon.neighbourhoods.includes(n))) { return true; }
            //     }));
            // });

            // reqPreferences.forEach((prefPkmn) => {
            //     found.forEach((pokemon) => {
            //         if (prefPkmn.name && prefPkmn.name !== pokemon.name) { return false; }
            //         if (prefPkmn.iv && prefPkmn.iv !== pokemon.iv) { return false; }
            //         if (prefPkmn.level && prefPkmn.level !== pokemon.level) { return false; }
            //         newPrefs.push({
            //             name: pokemon.name,
            //             neighbourhoods: pokemon.neighbourhoods.filter(n => !prefPkmn.neighbourhoods.includes(n)),
            //             iv: pokemon.iv,
            //             level: pokemon.level,
            //         });
            //     });
            // });

            // if (found.length > 0) {
            //     found.forEach(async (pkmn) => {
            //         res = await this.client.userRepository.pullFromUser(msg.author, {
            //             'preferences.wild.pokemons': pkmn,
            //         });
            //     });
            // }

            // if (newPrefs.length > 0) {
            //     newPrefs.forEach(async (pkmn) => {
            //         res = await this.client.userRepository.pushToUser(msg.author, {
            //             'preferences.wild.pokemons': pkmn,
            //         });
            //     });
            // }

            await msg.react('✅');
        } catch (e) {
            await msg.react('❌');
            await msg.channel.send(e.message);
            console.log(e);
        }
    }

    createQueryFromArgs(args) {
        const {
            pokemonNames,
            neighbourhoodNames,
            ivs,
            levels,
        } = this.client.utils.parseWildPreferenceQueryFromArgs(args);

        const pokemonFilters = [];

        if (pokemonNames.length > 0) {
            pokemonNames.forEach((pokemonName) => {
                const temp = {};
                temp.name = pokemonName;
                if (neighbourhoodNames.length > 0) {
                    temp.neighbourhoods = neighbourhoodNames.sort();
                }
                if (ivs[0]) {
                    temp.iv = parseInt(ivs[0], 10);
                }
                if (levels[0]) {
                    temp.level = parseInt(levels[0], 10);
                }
                pokemonFilters.push(temp);
            });
        } else {
            const temp = {};
            if (neighbourhoodNames.length > 0) {
                temp.neighbourhoods = neighbourhoodNames.sort();
            }
            if (ivs[0]) {
                temp.iv = parseInt(ivs[0], 10);
            }
            if (levels[0]) {
                temp.level = parseInt(levels[0], 10);
            }
            pokemonFilters.push(temp);
        }

        return pokemonFilters;
    }
};