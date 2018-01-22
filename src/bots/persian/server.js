// External dependencies.
const Discord = require("discord.js");
const client = new Discord.Client();

// Internal.
const Raid = require("./persian/Raid.js");
const RaidCollection = require("./persian/RaidCollection.js");
const RaidsRepository = require("./persian/RaidsRepository.js");
const NeighborhoodClass = require("./persian/Neighborhood.js");
const CommandManagerClass = require("./persian/commands/CommandManager.js")
const ConfigManager = require("./persian/ConfigManager.js")

console.log("Starting bot...\n");

var configs = ConfigManager.GetConfigs();
var secrets = ConfigManager.GetSecrets();

// Singletons.
var raidRepository = new RaidsRepository(secrets.mongo_connectionstring, configs.raids_collection);
var Neighborhood = new NeighborhoodClass(__dirname + "/" + configs.neighborhood_map_path);
var CommandManager = new CommandManagerClass(configs.command_prefix);


client.on("ready", () => {
    var meowth = client.users.find('username', "Meowth 2.0");
    if (!meowth) {
        console.log("Can't have Persian without a Meowth first!");
    }
    
    // onstart, launch DB cleanup again.
    raidRepository.GetAllRaids().then(async(raids) => {
        raids.forEach(raid => {
            timeoutRaid(raid);
        });
    }).catch(function(e) {
        console.log("-> Error getting raids from the repository.");
        console.log(e);
    });

    console.log("Persian up!");
});

client.on("message", async(message) => {
    var isIncomingRaid = 
        message.channel.name === configs.income_channel && 
        message.author.username === configs.income_username;

    var isAdminUser = message.author.username === configs.admin_user;

    // New raids found, insert in our storage.
    if (isIncomingRaid) {
        AddIncomingRaid(message);
    }
/*
    if (isTesting) {
        if (message.content == "!all") {
            raidRepository.GetAllRaids().then(async(raids) => {
                var raidCollection = new RaidCollection(raids);
                var messageText = raidCollection.GetDescription();

                var embed = {embed:{title:"All the raids!",description:messageText}};
                message.channel.send(embed);
            }).catch(function(e) {
                console.log("-> Error getting raids from the repository.");
                console.log(e);
            });
        }
    }*/

    var command = CommandManager.GetCommand(message);
    if (command !== null) {
        command.Execute();
    }

    if (message.author.username == "Meowth 2.0") { 
        // TODO: detect meowth's raid channel and dispatch starting commands?
        //console.log(message.author);
        /*if (message.channel.name == 'general') {
            matches = /<#(\d*)>/.exec(message.content)
            console.log(matches);
            message.channel.send(matches[1]);
            client.channels.get(matches[1]).send("This is a test");
        }*/
    }
});

function LogDeletingRaid(raid) {
    LogDiscord("[Raid Deleted]" + raid.GetDescription());
}

function LogNewRaid(raid) {
    LogDiscord("[New Raid]" + raid.GetDescription());
}

function LogDiscord(message) {
    client.channels.find('name', configs.log_channel).send(message).catch(function(e) {
        console.log("-> Looks like there was an error with Discord... Trying to fix it...");
        console.log(e);
        client = new Discord.Client();
    });
}

async function AddIncomingRaid(discordMessage) {
    console.log("============== RAID! ==============");
    
    try{
        var raid = new Raid();
        raid.BuildFromText(discordMessage.content);

        raid.originId = discordMessage.id;

        raid.neighborhood = Neighborhood.GetNeighborhood(raid.latitude, raid.longitude);

        await raidRepository.RemoveEquivalent(raid);
        raidRepository.ReportRaid(raid);
        LogNewRaid(raid);

        timeoutRaid(raid);
    }catch(e) {
        console.log(e);
    }

    console.log(raid.GetDescription());
    console.log("===================================");
}

function timeoutRaid(raid) {
    var timeout = raid.GetMinutesLeft() * 60 * 1000;
    setTimeout(function() {
        LogDeletingRaid(raid);
        raidRepository.RemoveRaid(raid);
    }, timeout);
    console.log("Raid set to timeout in " + timeout + " miliseconds. (" + (timeout / 60 / 1000) + " minutes.)");
}

function showAllRaidsByNeighborhood(discordMessage) {
    raidRepository.GetAllRaids().then(async(raids) => {
        raids.forEach(raid => {
            timeoutRaid(raid);
        });

        var raidCollection = new RaidCollection(raids);
        var messageText = raidCollection.GetDescription();

        var embed = {embed:{title:"All the raids!",description:messageText}};
        message.channel.send(embed);
    }).catch(function(e) {
        console.log("-> Error getting raids from the repository.");
        console.log(e);
    });
}

client.login(secrets.discord_bot_token);