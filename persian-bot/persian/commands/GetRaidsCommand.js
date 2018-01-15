const Discord = require("discord.js");
const DictUtils = require('../../../assets/modules/DictUtils');
const RaidsRepository = require('../../persian/RaidsRepository.js');
const ConfigManager = require('../../persian/ConfigManager.js');

class GetRaidsCommand {
    constructor(discordMessage, args) {
        this.discordMessage = discordMessage;
        this.args = args;
        this.dictUtils = new DictUtils();
        this.raidReactions = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];

        let configs = ConfigManager.GetConfigs();
        let secrets = ConfigManager.GetSecrets();
        this.raidRepository = new RaidsRepository(secrets.mongo_connectionstring, configs.raids_collection);
    }

    async Execute() {
        let initiator = this.discordMessage.author;
        let raidReactions = this.raidReactions;

        // First check if channel was specified. If not, assume current channel.
        let channel = this.args[1];
        if (typeof channel === undefined || channel == '') {
            channel = this.discordMessage.channel.name;
        }

        // With the channel, we then find a list of neighborhoods.
        let neighborhoods = this.dictUtils.getNeighbourhoodsFromRaidChannel(channel);
        if (neighborhoods.length <= 0) {
            let embed = { embed: { title: 'Invalid raid option: ' + this.args[1] + '.', description: "Did you mean: <suggestions not implemented yet>" } };
            await this.discordMessage.channel.send(embed);
            return;
        }

        neighborhoods.push(channel);
        neighborhoods = [...new Set(neighborhoods)];

        let foundRaids = [];
        for (var i = 0; i < neighborhoods.length; i++) {
            neighborhoods[i] = this.dictUtils.getNeighbourhoodSynonym(neighborhoods[i]);
            foundRaids = foundRaids.concat(await this.raidRepository.GetRaids(neighborhoods[i]));
        }

        // Build a list of available raids.
        let raidText = '';
        for (var i = 0; i < foundRaids.length; i++) {
            raidText += `${raidReactions[i]  } ${  foundRaids[i].GetDescription()  }\n`;
        }

        let raids = [];
        let embed = { embed: { title: 'Available raids in ' + this.args[1] + '.', description: raidText } };
        await this.discordMessage.channel.send(embed).then(async (message) => {
            // Add reactions so the user can select a raid to launch.
            for (let i = 0; i < foundRaids.length; i++) {
                await message.react(raidReactions[i]);
            }

            // Create a reaction collector
            let that = this;
            const collector = message.createReactionCollector(
                (reaction, user) => that.OnReactionApplied(initiator, reaction, message, foundRaids),
                { time: 15000 }
            );
            collector.on('collect', (r) => {
                // TODO: Put reaction logic here.
                //console.log(`Collected ${r.emoji.name}`);
            });
            collector.on('end', (collected) => {
                // TODO: Put reaction cleanup here.
                //console.log(`Collected ${collected} items`);
            });

        });
    }

    OnReactionApplied(initiator, reaction, message, raids) {
        // If a reaction reaches '2', that means the user has selected a raid.
        if (reaction.count >= 2 && reaction.users.find('username', initiator.username)) {
            // Find the chosen raid.
            for (let i = 0; i < this.raidReactions.length; i++) {
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
