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
            let embed = { embed: { 
                title: 'Invalid raid option: ' + this.args[1] + '.', 
                description: "Did you mean: <suggestions not implemented yet>" ,
                color: 0x6D0000
            } };
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

        let raidText = '';
        let color = 0x0;
        if (foundRaids.length <= 0) {
            raidText = 'No raid found.';
            color = 0xC2DC01;
        }else {
            color = 0x1B9600;
            // Build a list of available raids.
            for (var i = 0; i < foundRaids.length; i++) {
                raidText += `${raidReactions[i]  } ${  foundRaids[i].GetDescription()  }\n`;
            }
        }

        let embed = { embed: { title: 'Available raids in ' + this.args[1] + '.', description: raidText, color: color } };
        await this.discordMessage.channel.send(embed).then(async (message) => {
            let messageReactions = [];
            // Add reactions so the user can select a raid to launch.
            for (let i = 0; i < foundRaids.length; i++) {
                messageReactions.push(raidReactions[i]);
                await message.react(raidReactions[i]);
            }

            // Create a reaction collector
            let that = this;
            const collector = message.createReactionCollector(
                (reaction, user) => reaction.users.find('username', initiator.username) && messageReactions.includes(reaction.emoji.name),
                { max: 1 },
                { time: 15000 }
            );
            collector.on('collect', (reaction) => {
                // Find the chosen raid.
                for (let i = 0; i < this.raidReactions.length; i++) {
                    if (this.raidReactions[i] == reaction.emoji.name) {
                        message.channel.send(foundRaids[i].GetMeowthCommand());
                    }
                }
            });
            collector.on('end', (collected) => {
                message.clearReactions();
            });

        });
    }
}

module.exports = GetRaidsCommand;
