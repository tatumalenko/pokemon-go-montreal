class Raid {
    constructor(text) {
        // When the object is rebuilt by Mongo, it calls the constructor with the generic object as parameter.
        if (typeof text !== "string") {
            this._mapObject(text);
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
        return "**" + name + "** ending in **" + this.GetMinutesLeft() + " minutes** at __**" + this.address + "**__";
    }
    GetMeowthCommand() {
        var minutesLeft = this.GetMinutesLeft();
        var command = "!raid " + this.pokemon + " " + this.address + " " + minutesLeft;
        return command;
    }

    /**
     * Private function to extract a date from the text according to a regex.
     */
    _getDate(text, regex) {
        var matches = regex.exec(text);
        var date = new Date();
        var hours = parseInt(matches[1]);
        if (matches[4] == 'PM') {
            hours += 12;
        }
        date.setHours(hours, parseInt(matches[2]), parseInt(matches[3]));
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
    }
}

module.exports = Raid;