// Import the discord.js module
const Discord = require('discord.js');
const auth = require('./auth.json');

// Import the togeojson and fs module
let tj = require('togeojson'),
    fs = require('fs'),
    DOMParser = require('xmldom').DOMParser;

// Import the turf module
let turf = require('turf');

const didYouMean = require('didyoumean');
didYouMean.threshold = 1000;

// Import Pokedex class Pokemon
const pd = require('../slowpoke-bot/pokedex2.js');

let pkmndict = require('./pkmn.json');
//let nbhdict = require('./neighbourhoods.json');

const TWITTER_PATTERN = /(.*\])?\s?(.*) \([MFU]\) (\(IV: .*)? until (.*) at (.*) \[montrealpokemap.com.*(https:\/\/maps.google.com\/maps\?q=(\d*.\d*),(-?\d*.\d*))\)/;
//const DISCORD_PATTERN = /(.*)?.*\*\*(.*)\*\* \((.*%)\) .*\(CP: (.*)\) .*\(Level: (.*)\)\n\n.*\*\*Until\*\*: (\d\d:\d\d:\d\d[AP]M \(\d\d:\d\d left\)).*\n\*\*L30\+ IV\*\*: (\d+ - \d+ - \d+ .*)\(.*\).*\n\*\*L30\+ Moveset\*\*: (.*)\n.*\n\*\*Address\*\*: (.*)\n.*\n.*\n\*\*Google Map\*\*: <(.*)>/ig;
const DISCORD_PATTERN = /[\[.*\]]?\s?([a-zA-Z]+|[a-zA-Z]+ - \w)\s?-?\s? \((\d+%)\) - \(CP: (\d+)\) - \(Level: (-?\d+)\)[\s+]?\n[\s+]?\nUntil: (.*)[\s+]?\nL30\+ IV: (.*) \(\d+%\)[\s+]?\nL30\+ Moveset: (.*)[\s+]?\n.*\nAddress: (.*)\n.*\n.*\nGoogle Map: <?(.*)>?/;
//const DISCORD_PATTERN_NOSTATS = /[\[.*\]]?\s?([a-zA-Z]+|[a-zA-Z]+ - \w)\s?-?\s?\n\nUntil: (.*)[\s+]?\nAddress: (.*)\n.*\n.*\nGoogle Map: <?(.*)>?/;
const DISCORD_PATTERN_NOSTATS = /[\[.*\]]?\s?([a-zA-Z]+|[a-zA-Z]+\s?-?\s?\w)\s?-?\s?\n\nUntil: (.*)[\s+]?\nAddress: (.*)\n.*\n.*\nGoogle Map: <?(.*)>?/;
//----------------------------------------------------------------------------------------------
// Convert the *.kml file containing polygons into geojson format
//----------------------------------------------------------------------------------------------
let kml = new DOMParser().parseFromString(fs.readFileSync('neighbourhoods.kml', 'utf8'));
let polygonCollection = tj.kml(kml);
let polygons = [];
let neighbourhoodNames = [];
let cityNames = [];
let pokemonNames = pkmndict.pokemon_list;


for (let i = 0; i < polygonCollection.features.length; i++) {
    polygons[i] = polygonCollection.features[i];
}
for (var i = 0; i < polygons.length; i++) { // i: number of neighbourhood polygons
    for (var j = 0; j < polygons[i].geometry.coordinates[0].length; j++) { // j: number of gps triples within polygon
        polygons[i].geometry.coordinates[0][j].pop(); // Take out altitute coordinate {z: 0}
        polygons[i].geometry.coordinates[0][j].reverse(); // Flip (lng,lat) into (lat,lng) pairs
    }
    neighbourhoodNames[i] = polygons[i].properties.name;
}

//----------------------------------------------------------------------------------------------
// Startup Discord bot
//----------------------------------------------------------------------------------------------
// Create an instance of a Discord client
const client = new Discord.Client();

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
    console.log('-----------------------------------------------------------------');
    console.log('I am ready!');
    //console.log(client.guilds);
    let guild = client.guilds.find('id', '352462877845749762');
    let hasNeighbourhoodRole;

    neighbourhoodNames.forEach(function (neighbourhoodName) {
        hasNeighbourhoodRole = guild.roles.find('name', neighbourhoodName) ? true : false;

        if (!hasNeighbourhoodRole) {
            guild.createRole({
                    name: neighbourhoodName
                })
                .then(function (role) {
                    console.log(`Created neighbourhood role: ${role.name}`);
                })
                .catch(console.error);
        }
    });
    console.log('-----------------------------------------------------------------');
});

// Create an event listener for command messages
client.on('message', (message) => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    try {
        if (message.content.substring(0, 1) == '!') {
            let args = message.content.substring(1).split(' ');
            let cmd = args[0];

            args = args.splice(1);

            //let guild = client.guilds.find('id','352462877845749762');
            let member = message.member;
            let role;

            let memberRoles = [];

            if (args[0] !== undefined) {
                role = message.guild.roles.find('name', args[0].toLowerCase());
            }

            member.roles.forEach(role => memberRoles.push(role));

            switch (cmd) {
                case 'neighbourhoods':

                    message.channel.send(`raids-post, wilds-post, ${neighbourhoodNames.filter(e => e !== 'laval').join(', ')}`);
                    break;
                case 'cities':
                    for (let i = 0; i < neighbourhoodNames.filter(e => e !== 'laval').length + 2; i++) {
                        cityNames.push('Montreal Canada');
                    }
                    message.channel.send(cityNames.join(', '));
                    break;
                case 'foo':
                    message.channel.send(args);
                    break;
                case 'pikachu':
                    message.reply('Pika-Pika-chu!');
                    break;
                case 'want':
                    if (message.channel.name === 'bot-testing' || message.channel.name === 'wants-post') {

                        const pokemonConditionalRoles = ['iv90', 'iv100', 'cp2500', 'iv90lv30'];

                        if (args.join(' ').toLowerCase() === 'help more') {
                            message.channel.send({
                                embed: {
                                    description: '`Available Pokemon conditions to use in `**`\'!want <name/condition>\'`**`:`\n\n'

                                        +
                                        '`To get alerts for all Pokemon with IV > 90 (keep in mind if you select \'iv90\', by default you also get \'iv100\'), type: `\n: ' +
                                        '**`\'iv90\'`**`: `\n'

                                        +
                                        '`To get alerts for all Pokemon with IV > 100, type: `\n' +
                                        '**`\'iv100\'`**`: `\n'

                                        +
                                        '`To get alerts for all Pokemon with CP > 2500, type: `\n' +
                                        '**`\'cp2500\'`**`: `\n'

                                        +
                                        '`To get alerts for all Pokemon with IV > 90 AND LV = 30, type: `\n' +
                                        '**`\'iv90lv30\'`**`: `\n'

                                        +
                                        '`Available neighbourhood names to use in `**`\'!want <neighbourhood>\'`**`: `\n\n' +
                                        '`' + neighbourhoodNames.join('\n') + '`'
                                }
                            });
                            return;
                        }

                        if (args.length > 1) {
                            message.channel.send('Please only send one Pokemon or neighbourhood name per \'!want\' command.');
                            break;
                        }

                        if (!args.length) {
                            const rolesToFilter = ['@everyone', 'admin', 'bot', 'mods', 'mysticleader', 'instinctleader', 'valorleader', 'mystic', 'instinct', 'valor'];
                            let memberRoleNames = [];

                            //memberRoles.filter(e => !neighbourhoodNames.includes(e)).sort()
                            //memberRoles.filter(e => neighbourhoodNames.includes(e)).sort()

                            rolesToFilter.forEach(roleToFilter => memberRoles = memberRoles.filter(memberRole => memberRole.name !== roleToFilter));
                            memberRoles.forEach(role => memberRoleNames.push(role.name));
                            let pokemonConditonalMemberRoles = memberRoleNames.filter(e => !neighbourhoodNames.includes(e)).sort().join(', ');
                            let neighbourhoodMemberRoles = memberRoleNames.filter(e => neighbourhoodNames.includes(e)).sort().join(', ');
                            message.channel.send('**You are currently receiving alerts for**..\n ' +
                                '**Pokemon**: \n{`' + (pokemonConditonalMemberRoles ? pokemonConditonalMemberRoles : ' . ') + '`} ' +
                                '\n**Neighbourhoods**: \n{`' + (neighbourhoodMemberRoles ? neighbourhoodMemberRoles : ' ') + '`}');
                            break;
                        }

                        args.forEach(function (arg) {

                            if (arg.toLowerCase() === 'everywhere') {
                                let rolesToAdd = neighbourhoodNames;

                                rolesToAdd.forEach(function (roleToAdd) {
                                    if (!member.roles.find('name', roleToAdd)) {
                                        memberRoles.push(message.guild.roles.find('name', roleToAdd));
                                    }
                                });

                                member.setRoles(memberRoles).catch(console.error);
                                message.channel.send('Pikachu! Got it! ' + member + ' wants alerts for all neighbourhoods!');
                            } else if (neighbourhoodNames.filter((neighbourhoodName) => neighbourhoodName === arg.toLowerCase() ? true : false).length) {
                                if (member.roles.has(role.id)) {
                                    message.channel.send('Pikachu! ' + member + ', I already know you want alerts for ' + arg.toLowerCase());
                                } else {
                                    member.addRole(role).catch(console.error);
                                    message.channel.send('Pikachu! Got it! ' + member + ' wants alerts for ' + arg.toLowerCase());
                                }
                            } else if (pokemonNames.filter((pokemonName) => pokemonName.toLowerCase() === arg.toLowerCase() ? true : false).length || arg === 'iv90' || arg === 'iv100' || arg === 'cp2500' || arg === 'iv90lv30') {
                                if (role === undefined || role === null) {
                                    message.guild.createRole({
                                            name: arg.toLowerCase()
                                        })
                                        .then(function (role) {
                                            member.addRole(role).catch(console.error);
                                            message.channel.send('Pikachu! Got it! ' + member + ' wants alerts for ' + arg.toLowerCase());
                                            console.log(`Created Pokemon role: ${role.name}`);
                                        })
                                        .catch(console.error);
                                } else {

                                    if (member.roles.has(role.id)) {
                                        message.channel.send('Pikachu! ' + member + ', I already know you want alerts for ' + arg.toLowerCase());
                                    } else {
                                        member.addRole(role).catch(console.error);
                                        message.channel.send('Pikachu! Got it! ' + member + ' wants alerts for ' + arg.toLowerCase());
                                    }
                                }
                            } else if (arg.toLowerCase() === 'help') {
                                message.channel.send({
                                    embed: {
                                        description: '**Pika-chu**! `The `**`\'!want\'`**` command allows you to subscribe to wild spawn alerts for the Pokemon AND neighbourhoods you select!`\n\n'

                                            +
                                            '`This means that you will ONLY receive notifications via DM (direct message) IF you specified AT LEAST ONE neighbourhood. ' +
                                            'The only exception is `**`Unown`**`, which everyone who subscribes to will receive a DM regardless of location due to its extreme rarity.`\n\n'

                                            +
                                            '**`STEP 1`**`: Subscribe to specific Pokemon or condition by typing:`\n\n' +
                                            '             **`\'!want <name/condition>\'`** \n\n' +
                                            '**`\'name\'`**`: refers to one specific Pokemon name`\n' +
                                            '**`\'condition\'`**`: refers to predefined condition check for a Pokemon (options are \'iv90\', \'iv100\', \'cp2500\', \'iv90lv30\' see below for more details)`\n\n'

                                            +
                                            '**`STEP 2`**`: Subscribe to specific neighbourhood by typing:`\n\n' +
                                            '             **`\'!want <neighbourhood>\'`** \n\n' +
                                            '**`\'neighbourhood\'`**`: refers to one specific neighbourhood name (see below for a list of possible valid neighbourhood names)`\n\n'

                                            +
                                            '`For example: `\n\n' +
                                            '             **`\'!want iv90\'`** \n' +
                                            '             **`\'!want ville-marie\'`** \n\n' +
                                            '`Typing ^ those above, separately, will send you alerts for any Pokemon with an IV > 90 spawning in Ville-Marie. The command can be ' +
                                            'repeated any number of times to specify as many Pokemon name(s)/condition(s) and neighbourhood(s) as you desire.`\n\n'

                                            +
                                            '`To unsubscribe from a specific Pokemon name/condition or neighbourhood, type:` \n\n' +
                                            '             **`\'!unwant <name/condition/neighbourhood>\'`** \n\n'

                                            +
                                            '`To subscribe to ALL neighbourhood in one command, type:` \n\n' +
                                            '             **`\'!want everywhere\'`** \n\n'

                                            +
                                            '`To unsubscribe from ALL neighbourhoods in one command, type:` \n\n' +
                                            '             **`\'!unwant everywhere\'`**\n\n'

                                            +
                                            '`To list all Pokemon name(s)/condition(s) and neighbourhood(s) you are currently subsribed to, type:`\n\n' +
                                            '             **`\'!want\'`**\n\n'
                                    }
                                });
                                message.channel.send({
                                    embed: {
                                        description: '`Available Pokemon conditions to use in `**`\'!want <name/condition>\'`**`:`\n\n' +
                                            '**`\'iv90\'`**`: get alerts for all Pokemon with IV > 90 (keep in mind if you select \'iv90\', by default you also get \'iv100\') `\n' +
                                            '**`\'iv100\'`**`: get alerts for all Pokemon with IV > 100 `\n' +
                                            '**`\'cp2500\'`**`: get alerts for all Pokemon with CP > 2500 `\n' +
                                            '**`\'iv90lv30\'`**`: get alerts for all Pokemon with IV > 90 AND LV = 30 `\n\n'

                                            +
                                            '`Available neighbourhood names to use in `**`\'!want <neighbourhood>\'`**`: `\n\n' +
                                            '`' + neighbourhoodNames.join('\n') + '`'
                                    }
                                });
                            } else if (arg.toLowerCase() === 'help more') {
                                message.channel.send({
                                    embed: {
                                        description: '`Available Pokemon conditions to use in `**`\'!want <name/condition>\'`**`:`\n\n' +
                                            '**`\'iv90\'`**`: get alerts for all Pokemon with IV > 90 (keep in mind if you select \'iv90\', by default you also get \'iv100\') `\n' +
                                            '**`\'iv100\'`**`: get alerts for all Pokemon with IV > 100 `\n' +
                                            '**`\'cp2500\'`**`: get alerts for all Pokemon with CP > 2500 `\n\n'

                                            +
                                            '`Available neighbourhood names to use in `**`\'!want <neighbourhood>\'`**`: `\n\n' +
                                            '`' + neighbourhoodNames.join('\n') + '`'
                                    }
                                });
                            } else {
                                message.channel.send('Pikachu! "' + arg.toLowerCase() + '" is not a valid Pokemon or neighbourhood name. ' +
                                    'Did you mean "' + didYouMean(arg.toLowerCase(), neighbourhoodNames) + '"? ' +
                                    'or "' + didYouMean(arg.toLowerCase(), pokemonNames) + '"? ' +
                                    'Type `!want help` for a list of acceptable neighbourhood names.');
                            }
                        });
                    }
                    break;

                case 'unwant':
                    if (args.length > 1) {
                        message.channel.send('Please only send one Pokemon or neighbourhood name per \'!unwant\' command.');
                        break;
                    }

                    args.forEach(function (arg) {
                        if (message.channel.name === 'bot-testing' || message.channel.name === 'wants-post') {
                            if (arg.toLowerCase() === 'everywhere') {
                                let rolesToRemove = neighbourhoodNames;

                                rolesToRemove.forEach(roleToRemove => memberRoles = memberRoles.filter(memberRole => memberRole.name !== roleToRemove));

                                member.setRoles(memberRoles).catch(console.error);
                                message.react('✅');

                            } else if (neighbourhoodNames.filter((neighbourhoodName) => neighbourhoodName === arg.toLowerCase() ? true : false).length) {
                                if (member.roles.has(role.id)) {
                                    member.removeRole(role).catch(console.error);
                                    message.react('✅');
                                } else {
                                    message.react('✅');
                                }
                            } else if (pokemonNames.filter((pokemonName) => pokemonName.toLowerCase() === arg.toLowerCase() ? true : false).length || arg === 'iv90' || arg === 'iv100' || arg === 'cp2500' || arg === 'iv90lv30') {
                                if (!message.guild.roles.find('name', arg.toLowerCase())) {
                                    message.react('✅');
                                } else if (member.roles.has(role.id)) {
                                    member.removeRole(role).catch(console.error);
                                    message.react('✅');
                                } else {
                                    message.react('✅');
                                }
                            } else {
                                message.channel.send('Pikachu! "`' + arg.toLowerCase() + '`" is not a valid Pokemon or neighbourhood name. ' +
                                    'Did you mean "`' + didYouMean(arg.toLowerCase(), neighbourhoodNames) + '`"? ' +
                                    'or "`' + didYouMean(arg.toLowerCase(), pokemonNames) + '`"? ' +
                                    'Type "`!want help`" for a list of acceptable neighbourhood names.' +
                                    '\n**NOTE**: Type "`!unwant iv90`" if you are getting too many ghost/dark Pokemon notifications (assuming you are ' +
                                    'subscribed to the "`iv90`" filter).\n' +
                                    'Consider subscribing instead to the **new** "`iv90lv30`" filter (only "`IV > 90%`" and "`LV = 30`").');
                            }
                        }
                    });
                    break;
            }
        } else if (message.channel.name === 'discord-income') {
            findPointInPolygon2({
                message,
                spawn: createSpawn(message)
            });
        } else {
            // Message does not start with '!' nor does it originates from the 'tweet-income' channel
        }
    } catch (e) {
        console.log(e);
    }
});

// Login bot
client.login(auth.token);

function createSpawn(message) {
    const COORD_PATTERN = /.*q=(.*),(.*)/;

    let msg = message.content.replace(/\*/g, '');
    let regex = DISCORD_PATTERN.exec(msg);

    let hasStatsPattern;
    hasStatsPattern = regex === null ? false : true;

    let coordRegex;
    //let spawn = {};
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
            iv: undefined,
            cp: undefined,
            level: undefined,
            time: regex[2],
            stats: undefined,
            moveset: undefined,
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

function findPointInPolygon2({
    message,
    spawn
}) {
    if (spawn) {
        try {
            console.log('-----------------------------------------------------------------');
            console.log(spawn);
            console.log('-----------------------------------------------------------------');

            let hasFoundPoint;
            for (let i = 0; i < polygons.length; i++) {
                //console.log('Pikachu1: ' + polygons[i].geometry.coordinates);
                if (turf.inside(createPoint(spawn.coordinates), polygons[i])) {

                    const ctx = {
                        neighbourhood: polygons[i].properties.name,
                        ...spawn
                    };
                    const neighbourhood = polygons[i].properties.name;
                    // console.log('NEIGHBOURHOOD: ' + ctx.neighbourhood);
                    // console.log('CTX: ' + ctx.name);

                    message.guild.channels.find('name', 'bot-testing').send('Found a neighbourhood match: ' + polygons[i].properties.name);

                    //spawn.neighbourhood = polygons[i].properties.name;

                    if (polygons[i].properties.name === 'laval') { // Push spawn alert to Laval server
                        // SPAWN IS IN LAVAL
                        if (!client.guilds.get('343117705974644748').roles.find('name', spawn.name.toLowerCase())) {
                            // ROLE DOES NOT YET EXIST
                            client.guilds.get('343117705974644748').createRole({
                                    name: spawn.name.toLowerCase()
                                })
                                .then(function (role) {
                                    //sendEmbed2(role.guild, 'laval_spawns', spawn);
                                    sendAll([role.guild.channels.find('name', 'laval_spawns')], createEmbed(ctx));
                                    // channel.send('\n---------------------------------------');
                                    // console.log('Pokemon: ' + spawn.name + '\nNeighbourhood: ' + spawn.neigbourhood);
                                    // console.log('-----------------------------------------------------------------');
                                    console.log(`Created Pokemon role (laval): ${role.name}`);
                                })
                                .catch(console.error);
                        } else {
                            //sendEmbed2(client.guilds.get('343117705974644748'), 'laval_spawns', spawn);
                            sendAll([client.guilds.get('343117705974644748').channels.find('name', 'laval_spawns')], createEmbed(ctx));
                        }
                    } else { // Push spawn alert to MTL server
                        // SPAWN IS IN MONTREAL
                        if (!message.guild.roles.find('name', spawn.name.toLowerCase())) {
                            // ROLE DOES NOT YET EXIST
                            message.guild.createRole({
                                    name: spawn.name.toLowerCase()
                                })
                                .then(function (role) {
                                    //sendEmbed2(role.guild, 'wilds-post', spawn);
                                    sendAll([role.guild.channels.find('name', 'wilds-post')], createEmbed(ctx));
                                    //sendEmbedDM2(role.guild, spawn);
                                    sendAll(filteredSpawnMembers(role.guild.members, ctx), createEmbed(ctx));

                                    console.log(`Created Pokemon role: ${role.name}`);
                                })
                                .catch(console.error);
                        } else {
                            //sendEmbed2(message.guild, 'wilds-post', spawn);
                            sendAll([message.guild.channels.find('name', 'wilds-post')], createEmbed(ctx));
                            //sendEmbedDM2(message.guild, spawn);
                            sendAll(filteredSpawnMembers(message.guild.members, ctx), createEmbed(ctx));
                        }
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

function createEmbed(spawn) {
    // console.log('createEmbed:spawn.name : ' + spawn.name);
    // console.log('createEmbed:spawn.neighbourhood : ' + spawn.neighbourhood);
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

    const content = 'Pika-Pika! Wild ' + (spawn.neighbourhood !== 'laval' ? `${spawn.name}` : `@${spawn.name.toLowerCase()}`) +
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

function filteredSpawnMembers(members, ctx) {

    // console.log('filteredSpawnMembers:spawn.name : ' + ctx.name);
    // console.log('filteredSpawnMembers:spawn.neighbourhood : ' + ctx.neighbourhood);

    const conditions = [
        (member) => hasEveryRole(member, [ctx.name, ctx.neighbourhood]),
        (member) => hasEveryRole(member, ['unown']) && ctx.name.toLowerCase().includes('unown'),
        (member) => hasEveryRole(member, ['iv100', ctx.neighbourhood]) && ctx.iv.replace('%', '') >= 99,
        (member) => hasEveryRole(member, ['iv90', ctx.neighbourhood]) && ctx.iv.replace('%', '') >= 90,
        (member) => hasEveryRole(member, ['cp2500', ctx.neighbourhood]) && ctx.cp >= 2500,
        (member) => hasEveryRole(member, ['iv90lv30', ctx.neighbourhood]) && ctx.iv.replace('%', '') >= 90 && parseInt(ctx.level) > 29
    ];

    // for (let i = 0; i < conditions.length; i++) {
    //     console.log('i : ' + conditions[i].toString() + ' : ' + conditions[i](testMembers[0]));    
    // }


    // const testMembers = members.filterArray((member) => ['210950208421494797'].includes(member.id));
    // return filteredRecipients(testMembers, conditions);
    return filteredRecipients(members.array(), conditions);
}

function and(predicates) {
    return (value) => predicates.every(p => p(value));
}

function or(predicates) {
    return (value) => predicates.some(p => p(value));
}

function hasRole(member, roleName) {
    return member.roles.some(role => {
        return roleName.toLowerCase() === role.name;
    });
}

function hasSomeRole(member, roleNames) {
    roleNames.some(roleName => hasRole(member, roleName));
}

function hasEveryRole(member, roleNames) {
    return roleNames.map(roleName => hasRole(member, roleName)).every(e => e);
}

function filteredRecipients(recipients, conditions) {
    return recipients.filter(or(conditions));
}

async function sendAll(recipients, {
    content,
    embed
}) {
    let totalAlertsSent = 0;
    let successAlertRecipients = [];
    let failedAlertRecipients = [];
    //console.log(recipients);
    for (let recipient of recipients) {
        try {
            //console.log('Recipient : ' + (recipient instanceof Discord.GuildMember ? recipient.displayName : recipient.name));
            await recipient.send(content, embed);
            totalAlertsSent++;
            successAlertRecipients.push(recipient instanceof Discord.GuildMember ? recipient.displayName : recipient.name)
        } catch (e) {
            if (!failedAlertRecipients.length)
                failedAlertRecipients.push('\nERROR: \n');
            failedAlertRecipients.push('(CODE ' + e.code + ') ' + (recipient instanceof Discord.GuildMember ? recipient.displayName : recipient.name) + '\n');
            //console.error(e);
        }
    }
    console.log('\nAlert Destination: ' + (recipients.some(r => r instanceof Discord.GuildMember) ? 'Member(s)' : 'Channel(s)'));
    console.log('Total Alerts Sent Successful: ' + totalAlertsSent);
    console.log('(' + successAlertRecipients.join(', ') + ')');
    console.log('Total Alerts Sent Unsuccessful: ' + (recipients.length - totalAlertsSent));
    console.log('Alerts Failed: ' + (!failedAlertRecipients ? failedAlertRecipients.map(recipient => recipient.displayName).join(', ') : 0));
    console.log('-----------------------------------------------------------------');
}