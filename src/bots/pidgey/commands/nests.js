const request = require('request');
const Location = require('../../../models/Location.js');
const Utils = require('../../../utils/Utils.js');

module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'nests',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: ['nest'],
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

            // TODO: extract?
            const pokemonList = Utils.getPokemonNames();
            const englishName = Utils.getEnglishName(args[0]);
            const pokedexNumber = pokemonList.indexOf(englishName) + 1;

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

                    let message = '';

                    Object.keys(bodyObject.localMarkers).forEach((key) => {
                        const val = bodyObject.localMarkers[key];

                        const location = new Location({ coordinates: { latitude: val.lt, longitude: val.ln } });

                        message += `${location.neighbourhood}: ${location.gmapsUrl}\n`;
                    });

                    // TODO: Make a more beautiful message.
                    await msg.channel.send(message);
                }
            });
        } catch (e) {
            await msg.channel.send(e.message);
            console.log(e);
        }
    }
};
