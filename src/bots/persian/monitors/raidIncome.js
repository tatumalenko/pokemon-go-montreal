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
        console.log("==== INCOME ====");
        //console.log(msg);
        let raidSpawn = this._createRaidSpawnFromString(msg.content);
        console.log(raidSpawn);

        console.log("================");
    }

    _createRaidSpawnFromString(text) {
        // Get basic information from the first line of the raid.
        let firstLineRegex = /\*\*(.*)\*\* - Level: (\d)( - CP: (.*))?/;
        let firstLineMatches = firstLineRegex.exec(text);
        //let modifier = firstLineMatches.length == 5 ? 0 : 1;
        let name = firstLineMatches[1];
        let tier = firstLineMatches[2];
        //this.cp = firstLineMatches[4 - modifier];

        // TODO: moveset.

        // Find start and end time of the raid.
        let startRegex = /\*\*Start\*\*: (\d{2}):(\d{2}):(\d{2})(PM|AM)/;
        let startTime = this._getDate(text, startRegex);
        let endRegex = /\*\*End\*\*: (\d{2}):(\d{2}):(\d{2})(PM|AM)/;
        let endTime = this._getDate(text, endRegex);

        // location.
        let addressRegex = /\*\*Address\*\*: (.*)/;
        let addressMatches = addressRegex.exec(text);
        let address = addressMatches[1];

        let mapRegex = /\*\*Map\*\*: <(.*#(.*),(.*))>/;
        let mapMatches = mapRegex.exec(text);
        //let mapUrl = mapMatches[1];
        let latitude = mapMatches[2];
        let longitude = mapMatches[3];

        //let googleMapRegex = /\*\*Google Map\*\*: <(.*)>/;
        //let googleMapMatches = googleMapRegex.exec(text);
        //let googleMapUrl = googleMapMatches[1];

        let raidSpawn = new RaidSpawn({
            tier: tier,
            name: name,
            moveset: 'moveset...',
            time: { /*remaining: 'remaining...',*/ ending: endTime }, // ?!?
            location: {
                coordinates: {
                    latitude: latitude,
                    longitude: longitude,
                },
                address: address
            }
        });

        return raidSpawn;
    }

    /**
     * Private function to extract a date from the text according to a regex.
     * Code taken from: https://stackoverflow.com/questions/16382266/javascript-set-time-string-to-date-object
     * And modified...
     */
    _getDate(text, regex) {
        var parts = text.match(regex);

        var tempHours = parseInt(parts[1], 10);

        var hours = parts[4].toLowerCase().includes("am") ?
            function(am) {return am < 12 ? am : 0}(tempHours) :
            function(pm) {return pm < 12 ? pm + 12 : 12}(tempHours);

        var minutes = parseInt(parts[2], 10);
        var seconds = parseInt(parts[3], 10)

        var date = new Date();

        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(seconds);

        return date;
    };
}