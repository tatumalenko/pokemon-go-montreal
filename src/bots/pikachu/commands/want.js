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
                const wantSummary = this.createWildPreferenceString(user);
                if (!Array.isArray(wantSummary)) {
                    await msg.channel.send(wantSummary);
                } else {
                    wantSummary.forEach(async (str) => {
                        await msg.channel.send(str);
                    });
                }
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
                    if (e.message) { await msg.channel.send(e.message); }
                }
                return;
            }

            // '!want name uphillsimplex' or '!want id 165542964867760129'
            if (args.length === 2 && (args[0].toLowerCase() === 'id' || args[0].toLowerCase() === 'name')) {
                if (!msg.member.roles.some(role => role.name === 'admin' || role.name === 'mod')) {
                    await msg.channel.send('You do not have permission for this command! You n\'avez pas la permissions d\'utiliser cette commande!');
                    return;
                }
                const requestedDiscordMember = await this.client.guilds.get(this.client.configs.guildId).members.find(args[0].toLowerCase() === 'name' ? 'displayName' : 'id', args[1]);
                if (!requestedDiscordMember) {
                    await msg.channel.send('Could not find user in this server!');
                    return;
                }
                const requestedUser = await this.client.userRepository.fetchUser(requestedDiscordMember);
                const wantSummary = this.createWildPreferenceString(requestedUser);
                if (!Array.isArray(wantSummary)) {
                    await msg.channel.send(wantSummary);
                } else {
                    wantSummary.forEach(async (str) => {
                        await msg.channel.send(str);
                    });
                }
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
            } else if (e.message) { await msg.channel.send(e.message); }
            console.error(e);
            await msg.channel.send(e.message);
            await this.client.logger.logInfo(`${process.env.name}.${this.name}: ${e.message}`);
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
        if (!user) throw new Error('User is not found!');

        const userBlacklist = (user.preferences.wild.blacklist && user.preferences.wild.blacklist.length >= 1) ? user.preferences.wild.blacklist.sort().join(', ') : 'none/aucun';
        const userLocations = (user.locations && user.locations.length >= 1) ? user.locations.join(', ') : 'none/aucun';

        const strHeader = [`**USER/UTILISATEUR:** \`${user.name}\``];
        strHeader.push(`**STATUS:** \`${user.preferences.wild.status}\``);
        strHeader.push(`**BLACKLIST:** \`${userBlacklist}\``);
        strHeader.push(`**DEFAULT LOCATIONS DÉFAULTS:** \`${userLocations}\`\n`);
        strHeader.push('**NEIGHBOURHOOD/QUARTIER:**\n   `POKEMON | LV | IV`');

        const neighbourhoodKeyPokemonNameLevelIvValue = {};

        user.preferences.wild.pokemons.forEach((pokemon) => {
            if (!Object.keys(neighbourhoodKeyPokemonNameLevelIvValue).includes(pokemon.neighbourhoods.join(', '))) {
                neighbourhoodKeyPokemonNameLevelIvValue[pokemon.neighbourhoods.join(', ')] = [];
            }
            neighbourhoodKeyPokemonNameLevelIvValue[pokemon.neighbourhoods.join(', ')].push(`\`${pokemon.name} | ${pokemon.level} | ${pokemon.iv}\``);
        });

        const pokemonStatInfos = [];
        Object.keys(neighbourhoodKeyPokemonNameLevelIvValue).forEach((neighbourhood) => {
            const nameLevelIvs = neighbourhoodKeyPokemonNameLevelIvValue[neighbourhood];
            pokemonStatInfos.push(`**${neighbourhood}:**`, ...nameLevelIvs.sort().map(e => `   ${e}`));
        });

        return createStringOrArrayIfTooLong([...strHeader, ...pokemonStatInfos]);
    }
};

function createStringOrArrayIfTooLong(arrayOfStrings) {
    const MAX_CHAR_COUNT_PER_STRING = 2000 - 400; // 2000 char limit and some safety margin

    let tempString = '';
    const newArrayOfStrings = [];

    // eslint-disable-next-line
    for (const str of arrayOfStrings) {
        if (tempString.length + str.length < MAX_CHAR_COUNT_PER_STRING) {
            tempString += `${str}\n`;
        } else {
            newArrayOfStrings.push(tempString);
            tempString = `${str}\n`;
        }
    }
    if (newArrayOfStrings.length > 0) {
        newArrayOfStrings.push(tempString);
    }

    return newArrayOfStrings.length > 0 ? newArrayOfStrings : tempString;
}
