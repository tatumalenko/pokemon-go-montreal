/*
 * Pikachu Utility Functions  
 */

module.exports = {
    createSpawn,
    createPoint,
    findPointInPolygon,
    createEmbed,
    hasRole,
    sendAll
};

process.on('unhandledRejection', console.error); // Nodejs config to better trace unhandled promise rejections

// Import the discord.js module
const Discord = require('discord.js');

// Import Pokedex class Pokemon
const pd = require('../../../slowpoke-bot/assets/modules/pokedex');

// Import database utility functions module
const db = require('./dbutils');

// Import the turf module
let turf = require('turf');

const DISCORD_PATTERN = /[\[.*\]]?\s?([a-zA-Z]+|[a-zA-Z]+ - \w|[a-zA-Z]+[\'][a-zA-Z]+)\s?-?\s? \((\d+%)\) - \(CP: (\d+)\) - \(Level: (-?\d+)\)[\s+]?\n[\s+]?\nUntil: (.*)[\s+]?\nL30\+ IV: (.*) \(\d+%\)[\s+]?\nL30\+ Moveset: (.*)[\s+]?\n.*\nAddress: (.*)\n.*\n.*\nGoogle Map: <?(.*)>?/;
const DISCORD_PATTERN_NOSTATS = /[\[.*\]]?\s?([a-zA-Z]+|[a-zA-Z]+\s?-?\s?\w)\s?-?\s?\n\nUntil: (.*)[\s+]?\nAddress: (.*)\n.*\n.*\nGoogle Map: <?(.*)>?/;

const polygons = db.getPolygons();
const pokemonNames = db.getPokemons();

function createSpawn(message) {
    const COORD_PATTERN = /.*q=(.*),(.*)/;

    let msg = message.content.replace(/\*/g, '');
    let regex = DISCORD_PATTERN.exec(msg);

    let hasStatsPattern;
    hasStatsPattern = regex === null ? false : true;

    let coordRegex;

    if (hasStatsPattern) {
        coordRegex = COORD_PATTERN.exec(regex[9]);

        return {
            name: regex[1],
            iv: regex[2],
            cp: regex[3],
            level: regex[4],
            time: regex[5],
            stats: regex[6],
            moveset: regex[7],
            address: regex[8],
            maplink: regex[9].replace('>', ''),
            coordinates: [parseFloat(coordRegex[1]), parseFloat(coordRegex[2])]
        };
    } else {
        regex = DISCORD_PATTERN_NOSTATS.exec(msg);
        coordRegex = COORD_PATTERN.exec(regex[4]);

        return {
            name: regex[1],
            iv: 'NA',
            cp: 'NA',
            level: 'NA',
            time: regex[2],
            stats: 'NA',
            moveset: 'NA',
            address: regex[3],
            maplink: regex[4].replace('>', ''),
            coordinates: [parseFloat(coordRegex[1]), parseFloat(coordRegex[2])]
        };
    }
}

function createPoint(coordinates) {
    return {
        'type': 'Feature',
        'properties': {
            'marker-color': '#f00'
        },
        'geometry': {
            'type': 'Point',
            'coordinates': coordinates
        }
    };

}

async function findPointInPolygon({
    client,
    message,
    spawn
}) {
    if (spawn) {
        try {
            //console.log('-----------------------------------------------------------------');
            //console.log(spawn);
            //console.log('-----------------------------------------------------------------');

            let hasFoundPoint;
            for (let i = 0; i < polygons.length; i++) {
                if (turf.inside(createPoint(spawn.coordinates), polygons[i])) {
                    const ctx = {
                        client: client,
                        spawn: {
                            neighbourhood: polygons[i].properties.name,
                            ...spawn
                        }
                    };
                    const embed = createEmbed(ctx);

                    await message.guild.channels.find('name', 'bot-logs').send('Found a neighbourhood match: ' + polygons[i].properties.name);

                    if (polygons[i].properties.name === 'laval') { // Push spawn alert to Laval server
                        // SPAWN IS IN LAVAL
                        if (!client.guilds.get('343117705974644748').roles.find('name', spawn.name.toLowerCase())) {
                            // ROLE DOES NOT YET EXIST
                            await client.guilds.get('343117705974644748').createRole({
                                    name: spawn.name.toLowerCase().includes('unown') ? 'unown' : spawn.name.toLowerCase()
                                })
                                .then(function (role) {
                                    sendAll([role.guild.channels.find('name', 'laval_spawns')], embed);
                                    console.log(`Created Pokemon role (laval): ${role.name}`);
                                })
                                .catch(console.error);
                        } else {
                            //sendEmbed2(client.guilds.get('343117705974644748'), 'laval_spawns', spawn);
                            await sendAll([client.guilds.get('343117705974644748').channels.find('name', 'laval_spawns')], embed);
                        }
                    } else { // Push spawn alert to MTL server
                        // SPAWN IS IN MONTREAL
                        await sendAll([message.guild.channels.find('name', 'wilds-post')], embed);
                        //console.log(await db.getFilteredMembers(await message.guild.fetchMembers(), ctx));
                        await sendAll(await db.getFilteredMembers(message.guild, ctx), embed);
                        //sendAll([client.guilds.get('352462877845749762').members.find('displayName', 'uphillsimplex')], embed);
                    }
                    hasFoundPoint = true;
                    break;
                } else {
                    hasFoundPoint = false;
                }
            }

            if (!hasFoundPoint) {
                console.log('Coordinates not found in any of the polygons!');
                console.log('Pokemon: ' + spawn.name);
                console.log('Gmaps Link: ' + spawn.maplink);
                console.log('-----------------------------------------------------------------');
            }
        } catch (e) {
            console.log(e);
        }
        //------------------------------------------------------------------
    } else {
        console.log('-----------------------------------------------------------------');
        console.log('No regex match found!');
        console.log(message.content);
        console.log('-----------------------------------------------------------------');
    }
}

function createEmbed(ctx) {
    const client = ctx.client;
    const spawn = ctx.spawn;

    if (spawn.level < 0) {
        const ivRegExp = /\s*(\d*)\s*-\s*(\d*)\s*-\s*(\d*)/.exec(spawn.stats);
        const ctx = {
            name: spawn.name,
            cp: spawn.cp,
            iv: {
                atk: parseInt(ivRegExp[1]),
                def: parseInt(ivRegExp[2]),
                sta: parseInt(ivRegExp[3])
            }
        };
        const pkmn = new pd.Pokemon(ctx);
        spawn.level = pkmn.calcLevel();
    }

    const content = 'Pika-Pika! Wild ' + (spawn.neighbourhood !== 'laval' ? `${spawn.name}` : `${client.guilds.get('343117705974644748').roles.find('name', spawn.name.toLowerCase().includes('unown') ? 'unown' : spawn.name.toLowerCase())}`) +
        ` (IV: ${spawn.iv} - CP: ${spawn.cp} - LV: ${spawn.level}) spawning in ${spawn.neighbourhood}! \nDetails: ${spawn.address}`;

    const embed = {
        'embed': {
            title: 'Click here for directions to the wild ' + spawn.name + '!\n',
            description: '**Neighbourhood:** ' + spawn.neighbourhood +
                '\n**Spawns Until:** ' + spawn.time +
                '\n**Stats:** ' + spawn.stats + ' (' + spawn.iv + ')' +
                '\n**Moveset:** ' + spawn.moveset +
                '\n**Address:** ' + spawn.address,
            timestamp: new Date(),
            url: spawn.maplink,
            color: 3066993,
            thumbnail: {
                'url': 'https://floatzel.net/pokemon/black-white/sprites/images/' + (spawn.name.toLowerCase().includes('unown') ? 201 : (pokemonNames.findIndex((name) => name === spawn.name.toLowerCase() ? true : false) + 1)) + '.png'
            }
        }
    };

    return {
        content,
        embed
    };
}

function hasRole(member, roleName) {
    return member.roles.some(role => {
        return roleName.toLowerCase() === role.name;
    });
}

async function sendAll(recipients, {
    content,
    embed
}) {
    let totalAlertsSent = 0;
    let successAlertRecipients = [];
    let failedAlertRecipients = [];

    for (let recipient of recipients) {
        try {
            await recipient.send(content, embed);
            totalAlertsSent++;
            successAlertRecipients.push(recipient instanceof Discord.GuildMember ? recipient.displayName : recipient.name);
        } catch (e) {
            //console.log(recipients);
            if (!failedAlertRecipients.length)
                failedAlertRecipients.push('\nERROR: \n');
            failedAlertRecipients.push('(CODE ' + e.code + ') ' + (recipient instanceof Discord.GuildMember ? recipient.displayName : recipient.name) + '\n');
            console.log(e);
        }
    }
    //console.log('\nAlert Destination: ' + (recipients.some(r => r instanceof Discord.GuildMember) ? 'Member(s)' : 'Channel(s)'));
    console.log(content + '\nAlerts sent: ' + totalAlertsSent + ' (' + successAlertRecipients.join(', ') + ')');
    //console.log('(' + successAlertRecipients.join(', ') + ')');
    //console.log('Total Alerts Sent Unsuccessful: ' + (recipients.length - totalAlertsSent));
    //console.log('Alerts Failed: ' + (!failedAlertRecipients ? failedAlertRecipients.map(recipient => recipient.displayName).join(', ') : 0));
    console.log('-----------------------------------------------------------------');
}