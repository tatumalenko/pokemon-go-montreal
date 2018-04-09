const request = require('request');
const Location = require('../../../models/Location.js');

module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'nests',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: ['nest', 'nid', 'nids'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            if (args.length === 0) {
                await msg.channel.send(this.client.utils.createErrorMsg({
                    english: 'Please specify a Pokemon.',
                    french: 'S\'il vous plaît spécifier un Pokemon.',
                }));
                return;
            }

            // TODO: Extract that logic...
            const pokemonListEn = this.client.utils.getPokemonNames();
            const pokemonListFr = this.client.utils.getPokemonNames('french');
            let pokemonNameEn = '';
            let pokemonNameFr = '';
            let pokedexNumber = -1;
            // eslint-disable-next-line
            if (isNaN(args[0])) {
                if (!pokemonListEn.includes(args[0]) && !pokemonListFr.includes(args[0])) {
                    const test = this.client.spellchecker.getCorrections(args[0]).join(', ');

                    await msg.channel.send(this.client.utils.createErrorMsg({
                        english: `Unknown Pokémon ${args[0]}. Did you mean:`,
                        french: `Pokémon inconnu ${args[0]}. Vouliez-vous dire:\n ${test}`,
                    }));
                    return;
                }
                pokemonNameEn = this.client.utils.getEnglishName(args[0]);
                pokedexNumber = pokemonListEn.indexOf(pokemonNameEn) + 1;
            } else {
                [pokedexNumber] = args;
                pokemonNameEn = pokemonListEn[pokedexNumber - 1];
            }

            pokemonNameFr = pokemonListFr[pokedexNumber - 1];

            // TODO: extract configurations.
            const postData = {
                data: {
                    lat1: 45.71505275353951,
                    lng1: -74.02232029875363,
                    lat2: 45.39863265258384,
                    lng2: -73.2820990142938,
                    zoom: 10.587602669228598,
                    mapFilterValues: {
                        mapTypes: [1],
                        specieses: [pokedexNumber],
                        nestVerificationLevels: [1],
                        nestTypes: [-1],
                    },
                    center_lat: 45.55706542339709,
                    center_lng: -73.65220965652816,
                },
            };

            await request.post({ url: 'https://thesilphroad.com/atlas/getLocalNests.json', form: postData }, async (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    const bodyObject = JSON.parse(body);

                    if (bodyObject.localMarkers.length === 0) {
                        await msg.channel.send(this.client.utils.createErrorMsg({
                            english: `No nest found for ${pokemonNameEn} #${pokedexNumber}.`,
                            french: `Aucun nid trouvé pour ${pokemonNameFr} #${pokedexNumber}.`,
                        }));
                        return;
                    }

                    let description =
                        '**Nids répertoriés par des joueurs sur [TheSilphRoad](<https://thesilphroad.com/atlas#10.8/45.5389/-73.6532>)**\n' +
                        '**Nests reported by players on [TheSilphRoad](<https://thesilphroad.com/atlas#10.8/45.5389/-73.6532>)**\n';
                    Object.keys(bodyObject.localMarkers).forEach((key) => {
                        const val = bodyObject.localMarkers[key];

                        const location = new Location({ coordinates: { latitude: val.lt, longitude: val.ln } });

                        // message += `\t${location.neighbourhood}: <${location.gmapsUrl}>\n`;
                        description += `\t:arrow_forward: ${location.neighbourhood}: [Google Link](<${location.gmapsUrl}>)\n`;
                    });

                    // TODO: Make a more beautiful message.
                    await msg.channel.send({
                        embed: {
                            title: `${pokemonNameEn}/${pokemonNameFr} #${pokedexNumber}`,
                            description,
                            thumbnail: {
                                url: `http://floatzel.net/pokemon/black-white/sprites/images/${pokedexNumber}.png`,
                            },
                        },
                    });
                }
            });
        } catch (e) {
            await msg.channel.send(e.message);
            console.error(e);
        }
    }
};
