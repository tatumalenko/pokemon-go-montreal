const Raid = require("./Raid.js");

class RaidCollection {
    constructor(raids) {
        this.raids = raids;
        this.maxOutput = 10;
    }

    GetDescription() {
        var description = "";

        var sliced = this.raids.slice(0, this.maxOutput);

        sliced.forEach(function(raid, i) {
            description += (i + 1) + ". " + raid.GetDescription() + "\r";
        });

        var more = this.raids.length - this.maxOutput;
        if (more > 0) {
            description += "... and " + more + " more raids ...";
        }

        return description;
    }
}

module.exports = RaidCollection;