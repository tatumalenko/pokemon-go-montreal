const RaidSpawn = require('../../../models/RaidSpawn');

module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'raidIncome',
            enabled: true,
            runIn: ['raids-income'], // if = [] -> uses app.js runIn property values
            description: '',
        });
    }

    async run(msg, ...params) {
        console.log('==== INCOMING RAID ====');
        // Save the raid
        const raidSpawn = this.createRaidSpawnFromString(msg.content);
        this.client.raidRepository.addRaid(raidSpawn);
        console.log('> Updated raid!');
        console.log(raidSpawn);

        // Save/Update gym info.
        const gym = {
            name: raidSpawn.gym,
            latitude: raidSpawn.location.coordinates.latitude,
            longitude: raidSpawn.location.coordinates.longitude,
            neighbourhood: raidSpawn.location.neighbourhood,
            eligible: raidSpawn.eligible,
        };

        this.client.gymRepository.addUpdateGym(gym);
        console.log('> Updated gym!');
        console.log(gym);

        console.log('=======================');
    }

    createRaidSpawnFromString(text) {
        // Get basic information from the first line of the raid.
        const firstLineMatches = /\*\*(.*)\*\* - Level: (\d)( - CP: (.*))?/.exec(text);
        const name = firstLineMatches[1];
        const tier = firstLineMatches[2];

        // Find start and end time of the raid.
        const startTime = this.getDate(text, /\*\*Start\*\*: (\d{2}):(\d{2}):(\d{2})(PM|AM)/);
        const endTime = this.getDate(text, /\*\*End\*\*: (\d{2}):(\d{2}):(\d{2})(PM|AM)/);

        // location.
        const addressMatches = /\*\*Address\*\*: (.*)/.exec(text);
        const address = addressMatches[1];

        const mapMatches = /\*\*Map\*\*: <(.*#(.*),(.*))>/.exec(text);
        const latitude = mapMatches[2];
        const longitude = mapMatches[3];

        // Gym.
        const gymMatches = /\*\*Gym name\*\*: (.*)/.exec(text);
        const gym = gymMatches[1];

        // Moveset.
        const movesetMatches = /\*\*Moveset\*\*: (.*) - (.*)/.exec(text);
        let moveset = { fast: 'N/A', charge: 'N/A' };
        if (movesetMatches !== null) {
            moveset = { fast: movesetMatches[1], charge: movesetMatches[2] };
        }

        const eligible = text.includes('EX Raid Eligible: YES');

        const raidSpawn = new RaidSpawn({
            tier,
            name,
            gym,
            eligible,
            moveset,
            time: { ending: endTime },
            location: {
                coordinates: {
                    latitude,
                    longitude,
                },
                address,
            },
        });

        return raidSpawn;
    }

    /**
     * Private function to extract a date from the text according to a regex.
     * Code taken from: https://stackoverflow.com/questions/16382266/javascript-set-time-string-to-date-object
     * And modified...
     */
    getDate(text, regex) {
        const parts = text.match(regex);

        const tempHours = parseInt(parts[1], 10);

        const hours = parts[4].toLowerCase().includes('am') ?
            (function fixAM(am) { return am < 12 ? am : 0; }(tempHours)) :
            (function fixPM(pm) { return pm < 12 ? pm + 12 : 12; }(tempHours));

        const minutes = parseInt(parts[2], 10);
        const seconds = parseInt(parts[3], 10);

        const date = new Date();

        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(seconds);

        return date;
    }
};
