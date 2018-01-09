class Raid {
    constructor(object) {
        // When the object is rebuilt by Mongo, it calls the constructor with the generic object as parameter.
        if (typeof(object) === "undefined") {
            return;
        }
        if (typeof object !== "string") {
            this._mapObject(object);
        }
    }
    BuildFromText(text) {
        if (typeof text !== "string") {
            return;
        }

        // Get basic information from the first line of the raid.
        var firstLineRegex = /\*\*(.*)\*\* - Level: (\d)( - CP: (.*))?/;
        var firstLineMatches = firstLineRegex.exec(text);
        //var modifier = firstLineMatches.length == 5 ? 0 : 1;
        this.pokemon = firstLineMatches[1];
        this.level = firstLineMatches[2];
        //this.cp = firstLineMatches[4 - modifier];

        // TODO: moveset.

        // Find start and end time of the raid.
        var startRegex = /\*\*Start\*\*: (\d{2}):(\d{2}):(\d{2})(PM|AM)/;
        this.startTime = this._getDate(text, startRegex);
        var endRegex = /\*\*End\*\*: (\d{2}):(\d{2}):(\d{2})(PM|AM)/;
        this.endTime = this._getDate(text, endRegex);

        // TODO: location.
        var addressRegex = /\*\*Address\*\*: (.*)/;
        var addressMatches = addressRegex.exec(text);
        this.address = addressMatches[1];

        var mapRegex = /\*\*Map\*\*: <(.*#(.*),(.*))>/;
        var mapMatches = mapRegex.exec(text);
        this.mapUrl = mapMatches[1];
        this.latitude = mapMatches[2];
        this.longitude = mapMatches[3];

        var googleMapRegex = /\*\*Google Map\*\*: <(.*)>/;
        var googleMapMatches = googleMapRegex.exec(text);
        this.googleMapUrl = googleMapMatches[1];
    }

    GetMinutesLeft() {
        var diffMilli = this.endTime - Date.now();
        var diffMinutes = parseInt(diffMilli / (1000 * 60));
        return diffMinutes > 0 ? diffMinutes : 0;
    }
    GetDescription() {
        var name = this.pokemon.toLowerCase() === "egg" ? this.pokemon + " level " + this.level : this.pokemon;
        return "**" + name + "** ending in **" + this.GetMinutesLeft() + " minutes**" + 
               " at __**" + this.address + " (" + this.neighborhood + ")**__";
    }
    GetMeowthCommand() {
        var minutesLeft = this.GetMinutesLeft();
        var prefix = "%raid " + this.pokemon;
        if (this.pokemon.toLowerCase() === "egg") {
            prefix = "%raidegg " + this.level;
        }

        var command = prefix + " " + this.address + " " + minutesLeft;
        return command;
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

    _mapObject(object) {
        this.pokemon = object.pokemon;
        this.level = object.level;
        this.startTime = object.startTime;
        this.endTime = object.endTime;
        this.address = object.address;
        this.mapUrl = object.mapUrl;
        this.googleMapUrl = object.googleMapUrl;
        this.originId = object.originId;
        this.neighborhood = object.neighborhood;
    }
}

module.exports = Raid;