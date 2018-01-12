const MongoUtils = require('./MongoUtils');

const mongoutils = new MongoUtils();

const DictUtils = require('./DictUtils');

const dictutils = new DictUtils();

const pd = require('../../slowpoke-bot/assets/modules/pokedex');

class SpawnUtils {
    constructor() {

    }

    /* USED IN pikachu-bot2.js */
    createSpawn(message) {
        const DISCORD_PATTERN = /[\[.*\]]?\s?([a-zA-Z]+|[a-zA-Z]+ - \w|[a-zA-Z]+[\'][a-zA-Z]+)\s?-?\s? \((\d+%)\) - \(CP: (\d+)\) - \(Level: (-?\d+)\)[\s+]?\n[\s+]?\nUntil: (.*)[\s+]?\nWeather boosted: .*\nL30\+ IV: (.*) \(\d+%\)[\s+]?\nL30\+ Moveset: (.*)[\s+]?\n.*\nAddress: (.*)\n.*\n.*\nGoogle Map: <?(.*)>?/;
        const DISCORD_PATTERN_NOSTATS = /[\[.*\]]?\s?([a-zA-Z]+|[a-zA-Z]+\s?-?\s?\w)\s?-?\s?\n\nUntil: (.*)[\s+]?\nAddress: (.*)\n.*\n.*\nGoogle Map: <?(.*)>?/;
        const COORD_PATTERN = /.*q=(.*),(.*)/;

        const msg = message.content.replace(/\*/g, '');
        let regex = DISCORD_PATTERN.exec(msg);

        let hasStatsPattern;
        hasStatsPattern = regex !== null;

        let coordRegex;

        if (hasStatsPattern) {
            coordRegex = COORD_PATTERN.exec(regex[9]);

            return {
                name: regex[1],
                iv: regex[2],
                cp: regex[3],
                level: regex[4],
                time: regex[5],
                stats: regex[6],
                moveset: regex[7],
                address: regex[8],
                maplink: regex[9].replace('>', ''),
                coordinates: {
                    lat: parseFloat(coordRegex[1]),
                    lon: parseFloat(coordRegex[2]),
                },
            };
        }
        regex = DISCORD_PATTERN_NOSTATS.exec(msg);
        coordRegex = COORD_PATTERN.exec(regex[4]);

        return {
            name: regex[1],
            iv: 'NA',
            cp: 'NA',
            level: 'NA',
            time: regex[2],
            stats: 'NA',
            moveset: 'NA',
            address: regex[3],
            maplink: regex[4].replace('>', ''),
            coordinates: {
                lat: parseFloat(coordRegex[1]),
                lon: parseFloat(coordRegex[2]),
            },
        };
    }

    /* USED IN pikachu-bot2.js */
    createSpawnEmbed({
        spawn,
        client,
    }) {
        const pokemonNames = dictutils.getPokemonNamesArray();

        if (spawn.level < 0) {
            const ivRegExp = /\s*(\d*)\s*-\s*(\d*)\s*-\s*(\d*)/.exec(spawn.stats);
            const ctx = {
                name: spawn.name,
                cp: spawn.cp,
                iv: {
                    atk: parseInt(ivRegExp[1]),
                    def: parseInt(ivRegExp[2]),
                    sta: parseInt(ivRegExp[3]),
                },
            };
            const pkmn = new pd.Pokemon(ctx);
            spawn.level = pkmn.calcLevel();
        }

        const content = `Pika! Wild ${spawn.neighbourhood !== 'laval' ? `${spawn.name}` : `${client.guilds.get('343117705974644748').roles.find('name', spawn.name.toLowerCase().includes('unown') ? 'unown' : spawn.name.toLowerCase())}`
        } (IV: ${spawn.iv} - CP: ${spawn.cp} - LV: ${spawn.level}) spawning in ${spawn.neighbourhood}! \nDetails: ${spawn.address}`;

        const embed = {
            embed: {
                title: `Click here for directions to the wild ${spawn.name}!\n`,
                description: `**Neighbourhood:** ${spawn.neighbourhood
                }\n**Spawns Until:** ${spawn.time
                }\n**Stats:** ${spawn.stats} (${spawn.iv})` +
                    `\n**Moveset:** ${spawn.moveset
                    }\n**Address:** ${spawn.address}`,
                timestamp: new Date(),
                url: spawn.maplink,
                color: 3066993,
                thumbnail: {
                    url: `http://floatzel.net/pokemon/black-white/sprites/images/${spawn.name.toLowerCase().includes('unown') ? 201 : (pokemonNames.findIndex(name => (name === spawn.name.toLowerCase())) + 1)}.png`,
                },
            },
        };

        return {
            content,
            embed,
        };
    }

    getSpawnCoordinates(message) {
        const COORD_PATTERN = /.*q=(.*),(.*)/;
        const coordRegex = COORD_PATTERN.exec(message);

        // return [parseFloat(coordRegex[1]), parseFloat(coordRegex[2])];
        return {
            lat: parseFloat(coordRegex[1]),
            lon: parseFloat(coordRegex[2]),
        };
    }

    async getDiscordRecipientsArray({
        spawn,
        client,
    }) {
        try {
            if (spawn.neighbourhood === 'laval') {
                // // SPAWN IS IN LAVAL (PUSH IT TO THEIR SERVER)
                // if (!client.guilds.get('343117705974644748').roles.find('name', spawn.name.toLowerCase())) {
                //     // ROLE DOES NOT YET EXIST
                //     await client.guilds.get('343117705974644748').createRole({
                //             name: spawn.name.toLowerCase().includes('unown') ? 'unown' : spawn.name.toLowerCase()
                //         })
                //         .then(function (role) {
                //             return [role.guild.channels.find('name', 'laval_spawns')];
                //         })
                //         .catch(console.error);
                // } else {
                //     // ROLE DOES EXIST
                //     return [client.guilds.get('343117705974644748').channels.find('name', 'laval_spawns')];
                // }
            } else {
                // SPAWN IS IN MONTREAL
                const filter = {
                    pokemon: spawn.name.toLowerCase(),
                    neighbourhood: spawn.neighbourhood,
                    level: parseInt(spawn.level),
                    iv: parseInt(spawn.iv, 10),
                };

                const filteredMemberIds = await mongoutils.getFilteredMemberIds(filter);
                const filteredDiscordMembers = await filteredMemberIds.map(id => client.guilds.get('352462877845749762').members.find('id', id));
                return filteredDiscordMembers;
            }
        } catch (err) {
            console.log(err.stack);
        }
    }
}

module.exports = SpawnUtils;
