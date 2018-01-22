const Spawn = require('./Spawn');
const Pokemon = require('./Pokemon');

class WildSpawn extends Spawn {
    constructor({
        name,
        iv,
        cp,
        level,
        stats: {
            iv: { attack, defense, stamina },
        },
        weatherBoosted,
        gender,
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
        super({
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
        });
        // this.iv = iv;
        // this.cp = cp;
        // this.level = level;
        // this.stats = {
        //     iv: { attack, defense, stamina },
        // };
        this.weatherBoosted = weatherBoosted;
        this.gender = gender;

        const pokemon = new Pokemon({
            name,
            level,
            cp,
            iv,
            stats: {
                iv: { attack, defense, stamina },
            },
        });
        Object.assign(this, pokemon);
    }
}

module.exports = WildSpawn;
