const RaidsRepository = require("../persian/RaidsRepository.js");
const fs = require("fs");

var secretsString = fs.readFileSync(__dirname + "/../secrets.json");
var secrets = JSON.parse(secretsString);
var configsString = fs.readFileSync(__dirname + "/../configs.json");
var configs = JSON.parse(configsString);

var raidRepository = new RaidsRepository(secrets.mongo_connectionstring, configs.raids_collection);
/*
raidRepository.GetAllRaids().then(async(raids) => {
    raids.forEach(function(raid) {
        console.log(raid);
    });
});*/

raidRepository.GetRaid(45.457614, -73.88409).then(async(raid) => {
    console.log(raid);
});
