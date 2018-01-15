const DictUtils = require('../../../assets/modules/DictUtils');
const RaidsRepository = require('../../persian/RaidsRepository.js');
const ConfigManager = require('../../persian/ConfigManager.js');

class GetRaidsCommand {
    constructor(discordMessage, args) {
        this.discordMessage = discordMessage;
        this.args = args;
        this.dictUtils = new DictUtils();
        

        let configs = ConfigManager.GetConfigs();
        let secrets = ConfigManager.GetSecrets();
        this.raidRepository = new RaidsRepository(secrets.mongo_connectionstring, configs.raids_collection);
    }

    async Execute() {
        let allRaids = {};

        this.raidRepository.GetAllRaids().then(async(raids) => {
            raids.forEach(raid => {
                if (allRaids[raid.neighborhood] === undefined) {
                    allRaids[raid.neighborhood] = [];
                }

                allRaids[raid.neighborhood].push(raid);
            });

            let text = "Total in Montreal: " + raids.length + "\n";

            for (var neighborhood in allRaids) {
                text += neighborhood + " " + allRaids[neighborhood].length + "\n";
                console.log(text);
            }

            let embed = { embed: { title: 'Number of level 4 and 5 raids per neigborhood.', description: text } };
            await this.discordMessage.channel.send(embed);
        });

    }
}

module.exports = GetRaidsCommand;