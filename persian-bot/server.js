// External dependencies.
const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");

// Internal.
const Raid = require("./persian/Raid.js");
const RaidCollection = require("./persian/RaidCollection.js");
const RaidsRepository = require("./persian/RaidsRepository.js");
const NeighborhoodClass = require("./persian/Neighborhood.js");

console.log("Starting bot...\n");

const raidReactions = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];

// Loading secrets.
var secretsString = fs.readFileSync(__dirname + "/secrets.json");
var secrets = JSON.parse(secretsString);
console.log("Finished loading secrets. shhh...");

// Loading configs.
var configsString = fs.readFileSync(__dirname + "/configs.json");
var configs = JSON.parse(configsString);
console.log("=============== CONFIG ===============");
console.log(configs);
console.log("Finished loading config.");

// Singletons.
var raidRepository = new RaidsRepository(secrets.mongo_connectionstring, configs.raids_collection);
var Neighborhood = new NeighborhoodClass(__dirname + "/" + configs.neighborhood_map_path);


client.on("ready", () => {
    var meowth = client.users.find('username', "Meowth 2.0");
    if (!meowth) {
        console.log("Can't have Persian without a Meowth first!");
    }
    
    // TODO: onstart, launch DB cleanup again.
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
    // For now, Persian is in development phase. stay in the testing.
    var isIncomingRaid = message.channel.name === configs.income_channel && message.author.username === configs.income_username;
    var isTesting = message.channel.name === configs.test_channel && message.author.username === 'emman31';
    if (!isIncomingRaid && !isTesting) {
        return;
    }

    // New raids found, insert in our storage.
    if (isIncomingRaid) {
        AddIncomingRaid(message);
    }

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
    }

    // User commands management.
    if (message.content.startsWith(configs.command_prefix)) {
        var commandText = message.content.substring(configs.command_prefix.length);
        console.log("User: '" + message.author.username + "' Command: '" + message.content + "'");

        var commandArgs = commandText.split(" ");

        switch(commandArgs[0]) {
            case 'raids':
                // TODO: Detect current channel and find the neighborhood

                var foundRaids = await raidRepository.GetRaids(commandArgs[1]);
                console.log(foundRaids);

                var commandInitiator = message.author;
                
                // Build a list of available raids.
                var raidText = "";
                for (var i = 0; i < foundRaids.length; i ++) {
                    raidText += raidReactions[i] + " " + foundRaids[i].GetDescription() + "\n";
                }
        
                var raids = [];
                var embed = {embed:{title:"Available raids in " + commandArgs[1] + ".",description:raidText}};
                await message.channel.send(embed).then(async (message) => {
                    // Add reactions so the user can select a raid to launch.
                    for (var i = 0; i < foundRaids.length; i++) {
                        await message.react(raidReactions[i]);
                    }
        
                    // Keep a list of raids for the current message.
                    // TODO: test concurent messages.
                    raids[message.id] = foundRaids;
                    message.awaitReactions(function(reaction) {
                        // If a reaction reaches '2', that means the user has selected a raid.
                        if (reaction.count >= 2 && reaction.users.find('username', commandInitiator.username)) {
                            // Find the chosen raid.
                            for (var i = 0; i < raidReactions.length; i ++) {
                                if (raidReactions[i] == reaction.emoji.name) {
                                    // Send Meowth's command.
                                    message.channel.send(raids[message.id][i].GetMeowthCommand());
                                }
                            }
                            // remove the message to clear cluster...
                            message.delete();
                        }
                    });
                });
            break;
        }
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
    client.channels.find('name', configs.log_channel).send(message);
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

client.login(secrets.discord_bot_token);