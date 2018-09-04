const request = require('request-promise-native');
const Location = require('../models/Location.js');

class NestRepository {
    constructor(getNestsURL, postData) {
        this.getNestsURL = getNestsURL;
        this.postData = postData;
    }

    /**
     * Fetch a list of nests location from TSR for a particular pokemon.
     * @param {int|Array} pokedexNumber
     */
    async fetchNests(pokedexNumber) {
        // Add the pokedex number in the data posted to TSR.
        if (!Array.isArray(pokedexNumber)) {
            pokedexNumber = [pokedexNumber];
        }
        this.postData.data.mapFilterValues.specieses = pokedexNumber;

        const nests = [];

        await request({ method: 'POST', uri: this.getNestsURL, form: this.postData })
            .then((body) => {
                const bodyObject = JSON.parse(body);

                if (bodyObject.localMarkers.length === 0) {
                    return nests;
                }

                Object.keys(bodyObject.localMarkers).forEach((key) => {
                    const val = bodyObject.localMarkers[key];

                    const location = new Location({ coordinates: { latitude: val.lt, longitude: val.ln } });

                    nests.push({ id: key, pokedexNumber: val.pokemon_id, location });
                });
            })
            .catch((error) => {
                console.error(`Error while trying to get nest list for ${pokedexNumber}:\n${error}`);
            });

        return nests;
    }
}

module.exports = NestRepository;
