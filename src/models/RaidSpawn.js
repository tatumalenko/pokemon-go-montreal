const Spawn = require('./Spawn');
const Pokemon = require('./Pokemon');

class RaidSpawn extends Spawn {
    constructor({
        tier,
        name,
        gym,
        eligible,
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
        this.tier = tier;
        this.gym = gym;
        this.eligible = eligible;
    }
}

module.exports = RaidSpawn;
