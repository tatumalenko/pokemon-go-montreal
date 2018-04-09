const request = require('request-promise-native');
const Location = require('../models/Location.js');

class NestRepository {
    constructor(getNestsURL) {
        this.getNestsURL = getNestsURL;
    }

    async fetchNests(pokedexNumber) {
        // TODO: Configs.
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

        const nests = [];

        await request({ method: 'POST', uri: this.getNestsURL, form: postData })
            .then((body) => {
                const bodyObject = JSON.parse(body);

                if (bodyObject.localMarkers.length === 0) {
                    return nests;
                }

                Object.keys(bodyObject.localMarkers).forEach((key) => {
                    const val = bodyObject.localMarkers[key];

                    const location = new Location({ coordinates: { latitude: val.lt, longitude: val.ln } });

                    nests.push({ id: key, location });
                });
            })
            .catch((error) => {
                console.error(`Error while trying to get nest list for ${pokedexNumber}:\n${error}`);
            });

        return nests;
    }
}

module.exports = NestRepository;
