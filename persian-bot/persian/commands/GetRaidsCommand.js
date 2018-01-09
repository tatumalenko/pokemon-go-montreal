const DictU = require('../../../assets/modules/dictutils');
const RaidsRepository = require("../../persian/RaidsRepository.js");
const ConfigManager = require("../../persian/ConfigManager.js")

class GetRaidsCommand {
    constructor(discordMessage, args) {
        this.discordMessage = discordMessage;
        this.args = args;
        this.dictUtils = new DictU.DictUtils();
        this.raidReactions = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];

        var configs = ConfigManager.GetConfigs();
        var secrets = ConfigManager.GetSecrets();
        this.raidRepository = new RaidsRepository(secrets.mongo_connectionstring, configs.raids_collection);
    }

    async Execute() {
        var initiator = this.discordMessage.author;
        var raidReactions = this.raidReactions;

        //if (this.args[1] === "hoods" && isAdminUser) {
        //    showAllRaidsByNeighborhood(message);
        //}

        // First check if channel was specified. If not, assume current channel.
        var channel = this.args[1];
        if (typeof channel == undefined || channel == "") {
            channel = this.discordMessage.channel.name;
        }

        // With the channel, we then find a list of neighborhoods.
        var neighborhoods = this.dictUtils.getNeighbourhoodsFromRaidChannel(channel);
        neighborhoods.push(channel);
        neighborhoods = [... new Set(neighborhoods)];

        console.log("Neigborhoods:" + neighborhoods);
        var foundRaids = [];
        for (var i = 0; i < neighborhoods.length; i ++) {
            neighborhoods[i] = this.dictUtils.getNeighbourhoodSynonym(neighborhoods[i]);
            foundRaids = foundRaids.concat(await this.raidRepository.GetRaids(neighborhoods[i]));
        }

        // Build a list of available raids.
        var raidText = "";
        for (var i = 0; i < foundRaids.length; i ++) {
            raidText += raidReactions[i] + " " + foundRaids[i].GetDescription() + "\n";
        }

        var raids = [];
        var embed = {embed:{title:"Available raids in " + this.args[1] + ".",description:raidText}};
        await this.discordMessage.channel.send(embed).then(async (message) => {
            // Add reactions so the user can select a raid to launch.
            for (var i = 0; i < foundRaids.length; i++) {
                await message.react(raidReactions[i]);
            }

            // Create a reaction collector
            var that = this;
            const collector = message.createReactionCollector(
                (reaction, user) => that.OnReactionApplied(initiator, reaction, message, foundRaids),
                { time: 15000 }
            );
            collector.on('collect', r => {
                // TODO: Put reaction logic here.
                console.log(`Collected ${r.emoji.name}`)
            });
            collector.on('end', collected => {
                // TODO: Put reaction cleanup here.
                console.log(`Collected ${collected} items`);
            });

        });
    }

    OnReactionApplied(initiator, reaction, message, raids) {
        // If a reaction reaches '2', that means the user has selected a raid.
        if (reaction.count >= 2 && reaction.users.find('username', initiator.username)) {
            // Find the chosen raid.
            for (var i = 0; i < this.raidReactions.length; i ++) {
                if (this.raidReactions[i] == reaction.emoji.name) {
                    // Send Meowth's command.
                    message.channel.send(raids[i].GetMeowthCommand());
                    message.clearReactions(); // TODO: Should not clear reactions here?
                    return true;
                }
            }
        }
        return false;
    }
}

module.exports = GetRaidsCommand;