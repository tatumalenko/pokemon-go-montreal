const Location = require('../models/Location');

class Spawn {
    constructor({
        name,
        moveset: { fast, charge },
        time: { remaining, ending },
        location: {
            coordinates: {
                latitude,
                longitude,
            },
            address,
        },
    }) {
        this.name = name;
        this.moveset = { fast, charge };
        this.time = { remaining, ending };
        this.location = new Location({ coordinates: { latitude, longitude }, address });
    }
}

module.exports = Spawn;
