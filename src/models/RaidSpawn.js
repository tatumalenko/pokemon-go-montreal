const Spawn = require('./Spawn');
const Pokemon = require('./Pokemon');

class RaidSpawn extends Spawn {
    constructor({
        name,
        moveset,
        time: { remaining, ending },
        location: {
            coordinates: {
                latitude,
                longitude,
            },
            address,
        },
    }) {
        super({
            name,
            moveset,
            time: { remaining, ending },
            location: {
                coordinates: {
                    latitude,
                    longitude,
                },
                address,
            },
        });
        this.tier = 0;
    }
}

module.exports = RaidSpawn;
