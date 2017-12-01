// Import the discord.js module
const Discord = require('discord.js');
const auth = require('./auth.json');

// Import the togeojson and fs module
let tj = require('togeojson'),
    fs = require('fs'),
    DOMParser = require('xmldom').DOMParser;

// Import the turf module
let turf = require('turf');
 
//----------------------------------------------------------------------------------------------
// Convert the *.kml file containing polygons into geojson format
//----------------------------------------------------------------------------------------------
let kml = new DOMParser().parseFromString(fs.readFileSync('neighbourhoods.kml', 'utf8'));
let polygonCollection = tj.kml(kml);
let polygons = [];
for (let i = 0; i < polygonCollection.features.length; i++) {
    polygons[i] = polygonCollection.features[i];
}
for (var i = 0; i < polygons.length; i++) { // i: number of neighbourhood polygons
    for (var j = 0; j < polygons[i].geometry.coordinates[0].length ; j++) { // j: number of gps triples within polygon
        polygons[i].geometry.coordinates[0][j].pop(); // Take out altitute coordinate {z: 0}
        polygons[i].geometry.coordinates[0][j].reverse(); // Flip (lng,lat) into (lat,lng) pairs
    }
}

// let neighbourhood = [];
// let neighbourhoodNames = [];
// for (let i = 0; i < polygonCollection.features.length; i++) {
//     neighbourhood[i] = [];
//     neighbourhoodNames[i] = polygonCollection.features[i].properties.name;
//     for (let j = 0; j < polygonCollection.features[i].geometry.coordinates[0].length ; j++) {
//         neighbourhood[i][j] = [polygonCollection.features[i].geometry.coordinates[0][j][1], polygonCollection.features[i].geometry.coordinates[0][j][0]];
//     }
// }

// Create poly array containing 
// let poly = [];
// for (let i = 0; i < neighbourhood.length; i++) {
//     poly[i] = {
//         "type": "Feature",
//         "properties": {},
//         "geometry": {
//             "type": "Polygon",
//             "coordinates": [neighbourhood[i]]
//         }
//     };
// }

// Create an instance of a Discord client
const client = new Discord.Client();

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
  console.log('I am ready!');
});

// Create an event listener for command messages
client.on('message', (message) => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`

    if (message.content.substring(0, 1) == '!') {
        let args = message.content.substring(1).split(' ');
        let cmd = args[0];

        args = args.splice(1);
        switch(cmd) {
            case 'pikachu':
                message.reply('Pika-Pika-chu!');
                break;
        }
    } else {
        let re = /(.*\])?\s?(.*) \([MF]\) (\(IV: .*)? until (.*) at (.*) \[montrealpokemap.com.*(https:\/\/maps.google.com\/maps\?q=(\d*.\d*),(-?\d*.\d*))/;

        wild_channel = message.guild.channels.find("name", "wilds-post");

        if (message.embeds[0]) {
            let match_str = re.exec(message.embeds[0].description);

            console.log(message.embeds[0].description);
            if (match_str) {
                
                if(match_str[3] !== undefined){
                    wild_channel.send('Pika-Pika-Pi! Wild ' + match_str[2] + ' ' + match_str[3] + ' spawning until ' + match_str[4] + ' at ' + match_str[5] + ' (<' + match_str[6] + '>)');
                } else {
                    wild_channel.send('Pika-Pika-Pi! Wild ' + match_str[2] + ' spawning until ' + match_str[4] + ' at ' + match_str[5] + ' (<' + match_str[6] + '>)');
                }

                //------------------------------------------------------------------
                try {
                    let pt1 = {
                        "type": "Feature",
                        "properties": {
                            "marker-color": "#f00"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [parseFloat(match_str[7]),parseFloat(match_str[8])]
                        }
                    };
                    console.log(pt1.geometry.coordinates);
                    
                    for (let i = 0; i < polygons.length; i++) {

                        if (turf.inside(pt1, poly[i])) { // turf.inside(point, polygonCollection.features[i])

                            message.guild.channels.find('name','bot-testing').send('Found a neighbourhood match: ' + polygons[i].properties.name);

                            if (polygons[i].properties.name === 'laval') { // Push spawn alert to Laval server
                                if (match_str[3] !== undefined) {
                                    client.guilds.get('343117705974644748').channels.find('name','laval_spawns').send('Pika-Pika-Pi! Wild ' + client.guilds.get('343117705974644748').roles.find("name", match_str[2].toLowerCase()) + ' ' + match_str[3] + ' spawning until ' + match_str[4] + ' at ' + match_str[5] + ' (<' + match_str[6] + '>)');
                                } else {
                                    client.guilds.get('343117705974644748').channels.find('name','laval_spawns').send('Pika-Pika-Pi! Wild ' + client.guilds.get('343117705974644748').roles.find("name", match_str[2].toLowerCase()) + ' spawning until ' + match_str[4] + ' at ' + match_str[5] + ' (<' + match_str[6] + '>)');
                                }
                            } else {
                                if (match_str[3] !== undefined) { // Push spawn alert to Montreal server
                                    message.guild.channels.find('name',polygons[i].properties.name).send('Pika-Pika-Pi! Wild ' + message.guild.roles.find("name", match_str[2].toLowerCase()) + ' ' + match_str[3] + ' spawning until ' + match_str[4] + ' at ' + match_str[5] + ' (<' + match_str[6] + '>)');
                                } else {
                                    message.guild.channels.find('name',polygons[i].properties.name).send('Pika-Pika-Pi! Wild ' + message.guild.roles.find("name", match_str[2].toLowerCase()) + ' spawning until ' + match_str[4] + ' at ' + match_str[5] + ' (<' + match_str[6] + '>)');
                                }
                            }
                            break;
                        }
                        else {
                            
                        }
                    }
                }
                catch (e) {
                    console.log(e);
                }
                //------------------------------------------------------------------
            } else {
                //message.channel.send(message.embeds[0].description);
                //console.log(message.embeds[0].description);
                //console.log(match_str[1]);
            }
        } else {
            //console.log(message.embeds[0].description);
            //console.log(match_str[1]);
        }
    }
});

// Log our bot in
client.login(auth.token);