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
const DISCORD_PATTERN_NOSTATS = /[\[.*\]]?\s?([a-zA-Z]+|[a-zA-Z]+ - \w)\s?-?\s?\n\nUntil: (.*)[\s+]?\nAddress: (.*)\n.*\n.*\nGoogle Map: <?(.*)>?/;
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

                    if (args.join(' ').toLowerCase() === 'help more') {
                        message.channel.send({ embed: {
                            description: '`Available Pokemon conditions to use in `**`\'!want <name/condition>\'`**`:`\n\n'
                            
                            + '`To get alerts for all Pokemon with IV > 90 (keep in mind if you select \'iv90\', by default you also get \'iv100\'), type: `\n: '
                            + '**`\'iv90\'`**`: `\n'

                            + '`To get alerts for all Pokemon with IV > 100, type: `\n'
                            + '**`\'iv100\'`**`: `\n'

                            + '`To get alerts for all Pokemon with CP > 2500, type: `\n'
                            + '**`\'cp2500\'`**`: `\n'

                            + '`Available neighbourhood names to use in `**`\'!want <neighbourhood>\'`**`: `\n\n'
                            + '`' + neighbourhoodNames.join('\n') + '`'
                        }}); 
                        return;
                    }

                    if (args.length > 1) {
                        message.channel.send('Please only send one Pokemon or neighbourhood name per \'!want\' command.');
                        break;
                    }

                    if (!args.length) {
                        const rolesToFilter = ['@everyone', 'admin', 'bot', 'mods', 'mysticleader', 'instinctleader', 'valorleader', 'mystic', 'instinct', 'valor'];
                        let memberRoleNames = [];

                        rolesToFilter.forEach(roleToFilter => memberRoles = memberRoles.filter(memberRole => memberRole.name !== roleToFilter));
                        memberRoles.forEach(role => memberRoleNames.push(role.name));
                        message.channel.send(`You are currently receiving alerts for: \n\`${memberRoleNames.join(', ')}\`.`);
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
                        } else if (pokemonNames.filter((pokemonName) => pokemonName.toLowerCase() === arg.toLowerCase() ? true : false).length || arg === 'iv90' || arg === 'iv100' || arg === 'cp2500') {
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
                            message.channel.send({ embed: {
                                description: '**Pika-chu**! `The `**`\'!want\'`**` command allows you to subscribe to wild spawn alerts for the Pokemon AND neighbourhoods you select!`\n\n'

                                + '`This means that you will ONLY receive notifications via DM (direct message) IF you specified AT LEAST ONE neighbourhood. '
                                + 'The only exception is `**`Unown`**`, which everyone who subscribes to will receive a DM regardless of location due to its extreme rarity.`\n\n'
                                
                                + '**`STEP 1`**`: Subscribe to specific Pokemon or condition by typing:`\n\n'
                                + '             **`\'!want <name/condition>\'`** \n\n'
                                + '**`\'name\'`**`: refers to one specific Pokemon name`\n'
                                + '**`\'condition\'`**`: refers to predefined condition check for a Pokemon (options are \'iv90\', \'iv100\', \'cp2500\', see below for more details)`\n\n'
                                
                                + '**`STEP 2`**`: Subscribe to specific neighbourhood by typing:`\n\n'
                                + '             **`\'!want <neighbourhood>\'`** \n\n'
                                + '**`\'neighbourhood\'`**`: refers to one specific neighbourhood name (see below for a list of possible valid neighbourhood names)`\n\n'
                                
                                + '`For example: `\n\n'
                                + '             **`\'!want iv90\'`** \n'
                                + '             **`\'!want ville-marie\'`** \n\n' 
                                + '`Typing ^ those above, separately, will send you alerts for any Pokemon with an IV > 90 spawning in Ville-Marie. The command can be ' 
                                + 'repeated any number of times to specify as many Pokemon name(s)/condition(s) and neighbourhood(s) as you desire.`\n\n'

                                + '`To unsubscribe from a specific Pokemon name/condition or neighbourhood, type:` \n\n'
                                + '             **`\'!unwant <name/condition/neighbourhood>\'`** \n\n'
                                
                                + '`To subscribe to ALL neighbourhood in one command, type:` \n\n'
                                + '             **`\'!want everywhere\'`** \n\n'
                        
                                + '`To unsubscribe from ALL neighbourhoods in one command, type:` \n\n'
                                + '             **`\'!unwant everywhere\'`**\n\n' 

                                + '`To list all Pokemon name(s)/condition(s) and neighbourhood(s) you are currently subsribed to, type:`\n\n'
                                + '             **`\'!want\'`**\n\n'}});
                            message.channel.send({ embed: {
                                description: '`Available Pokemon conditions to use in `**`\'!want <name/condition>\'`**`:`\n\n'
                                + '**`\'iv90\'`**`: get alerts for all Pokemon with IV > 90 (keep in mind if you select \'iv90\', by default you also get \'iv100\') `\n'
                                + '**`\'iv100\'`**`: get alerts for all Pokemon with IV > 100 `\n'
                                + '**`\'cp2500\'`**`: get alerts for all Pokemon with CP > 2500 `\n\n'

                                + '`Available neighbourhood names to use in `**`\'!want <neighbourhood>\'`**`: `\n\n'
                                + '`' + neighbourhoodNames.join('\n') + '`'
                            }}); 
                        } else if (arg.toLowerCase() === 'help more') {
                            message.channel.send({ embed: {
                                description: '`Available Pokemon conditions to use in `**`\'!want <name/condition>\'`**`:`\n\n'
                                + '**`\'iv90\'`**`: get alerts for all Pokemon with IV > 90 (keep in mind if you select \'iv90\', by default you also get \'iv100\') `\n'
                                + '**`\'iv100\'`**`: get alerts for all Pokemon with IV > 100 `\n'
                                + '**`\'cp2500\'`**`: get alerts for all Pokemon with CP > 2500 `\n\n'

                                + '`Available neighbourhood names to use in `**`\'!want <neighbourhood>\'`**`: `\n\n'
                                + '`' + neighbourhoodNames.join('\n') + '`'
                            }}); 
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
                        } else if (pokemonNames.filter((pokemonName) => pokemonName.toLowerCase() === arg.toLowerCase() ? true : false).length || arg === 'iv90'|| arg === 'iv100' || arg === 'cp2500') {
                            if (!message.guild.roles.find('name', arg.toLowerCase())) {
                                message.react('✅');
                            } else if (member.roles.has(role.id)) {
                                member.removeRole(role).catch(console.error);
                                message.react('✅');
                            } else {
                                message.react('✅');
                            }
                        } else {
                            message.channel.send('Pikachu! "' + arg.toLowerCase() + '" is not a valid Pokemon or neighbourhood name. ' +
                                    'Did you mean "' + didYouMean(arg.toLowerCase(), neighbourhoodNames) + '"? ' +
                                    'or "' + didYouMean(arg.toLowerCase(), pokemonNames) + '"? ' +
                                    'Type `!want help` for a list of acceptable neighbourhood names.');
                        }
                    }
                });
                break;
            }
        } else if (message.channel.name === 'tweet-income') {

            // if (message.embeds[0] !== undefined) {
            //     let regex = TWITTER_PATTERN.exec(message.embeds[0].description);
            //     findPointInPolygon1(message, regex);

            // } 
        } else if (message.channel.name === 'discord-income') {
            let msg = message.content.replace(/\*/g, '');
            let regex = DISCORD_PATTERN.exec(msg);
            findPointInPolygon2(message, regex);
        } else {
            // Message does not start with '!' nor does it originates from the 'tweet-income' channel
        }
    } catch (e) {
        console.log(e);
    }
});

// Login bot
client.login(auth.token);


function findPointInPolygon2(message, regex) {
    if (regex !== null) {
        const COORD_PATTERN = /.*q=(.*),(.*)/;
        const coordRegex = COORD_PATTERN.exec(regex[9]);
        //------------------------------------------------------------------
        try {
            const pokemon = {
                name: regex[1],
                iv: regex[2],
                cp: regex[3],
                level: regex[4],
                time: regex[5],
                stats: regex[6],
                moveset: regex[7],
                address: regex[8],
                maplink: regex[9].replace('>',''),
                coordinates: [parseFloat(coordRegex[1]), parseFloat(coordRegex[2])]
            };
            console.log('-----------------------------------------------------------------');
            console.log(pokemon);
            console.log('-----------------------------------------------------------------');
            let point = {
                'type': 'Feature',
                'properties': {
                    'marker-color': '#f00'
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': pokemon.coordinates
                }
            };

            let hasFoundPoint;
            for (let i = 0; i < polygons.length; i++) {

                if (turf.inside(point, polygons[i])) {

                    message.guild.channels.find('name', 'bot-testing').send('Found a neighbourhood match: ' + polygons[i].properties.name);

                    if (polygons[i].properties.name === 'laval') { // Push spawn alert to Laval server
                        if (!client.guilds.get('343117705974644748').roles.find('name', pokemon.name.toLowerCase())) {
                            client.guilds.get('343117705974644748').createRole({
                                name: pokemon.name.toLowerCase()
                            })
                                .then(function (role) {
                                    sendEmbed2(role.guild, 'laval_spawns', polygons[i].properties.name, regex);
                                    console.log(`Created Pokemon role (laval): ${role.name}`);
                                })
                                .catch(console.error);
                        } else {
                            sendEmbed2(client.guilds.get('343117705974644748'), 'laval_spawns', polygons[i].properties.name, regex);
                        }
                    } else { // Push spawn alert to MTL server
                        //console.log(!message.guild.roles.find('name', pokemon.name.toLowerCase()));
                        if (!message.guild.roles.find('name', pokemon.name.toLowerCase())) {
                            message.guild.createRole({
                                name: pokemon.name.toLowerCase()
                            })
                                .then(function (role) {
                                    sendEmbed2(role.guild, 'wilds-post', polygons[i].properties.name, regex);
                                    sendEmbedDM2(role.guild, polygons[i].properties.name, regex);

                                    console.log(`Created Pokemon role: ${role.name}`);
                                })
                                .catch(console.error);
                        } else {
                            sendEmbed2(message.guild, 'wilds-post', polygons[i].properties.name, regex);
                            sendEmbedDM2(message.guild, polygons[i].properties.name, regex);
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
                console.log('Pokemon: ' + pokemon.name);
                console.log('GMaps Link: ' + pokemon.maplink);
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

function sendEmbed2(guild, channelName, neighbourhoodName, regex) {

    const pokemon = {
        name: regex[1],
        iv: regex[2],
        cp: regex[3],
        level: regex[4],
        time: regex[5],
        stats: regex[6],
        moveset: regex[7],
        address: regex[8],
        maplink: regex[9].replace('>','')
    };

    const ivRegExp = /\s*(\d*)\s*-\s*(\d*)\s*-\s*(\d*)/.exec(pokemon.stats);
    const ctx = {
        name: pokemon.name,
        cp: pokemon.cp,
        iv: {atk: parseInt(ivRegExp[1]), def: parseInt(ivRegExp[2]), sta: parseInt(ivRegExp[3])}
    };

    let pokemonRole = guild.roles.find('name', pokemon.name.toLowerCase());

    let pkmn;
    if (pokemon.level < 0) {
        //pokemon.level = 'NA';
        pkmn = new pd.Pokemon(ctx);
        pokemon.level = pkmn.calcLevel();
        //console.log(pokemon.stats, ctx.iv, pokemon.level);
    }

    //console.log(pkmn.stats.base, pkmn.iv, pkmn.cp, pkmn.calcLevel(), 'cpm:' + cpm);

    let channel = guild.channels.find('name', channelName);
    //let pokemonRole = guild.roles.find('name', pokemonName.toLowerCase());
    //let neighbourhoodRole = guild.roles.find('name', neighbourhoodName);

    let content = '';

    if (neighbourhoodName !== 'laval') {
        content = `Pika-Pika! Wild ${pokemon.name} (IV: ${pokemon.iv} - CP: ${pokemon.cp} - LV: ${pokemon.level}) spawning in ${neighbourhoodName}! \nDetails: ${pokemon.address}`;
    } else {
        content = `Pika-Pika! Wild ${pokemonRole} (IV: ${pokemon.iv} - CP: ${pokemon.cp} - LV: ${pokemon.level}) spawning in ${neighbourhoodName}! \nDetails: ${pokemon.address}`;
    }

    const embed = {
        'embed': {
            title: 'Click here for directions to the wild ' + pokemon.name + '!\n',
            description: '**Neighbourhood:** ' + neighbourhoodName 
                        + '\n**Spawns Until:** ' + pokemon.time 
                        + '\n**Stats:** ' + pokemon.stats + ' (' + pokemon.iv + ')' 
                        + '\n**Moveset:** ' + pokemon.moveset 
                        + '\n**Address:** ' + pokemon.address,
            timestamp: new Date(),
            url: pokemon.maplink,
            color: 3066993,
            thumbnail: {
                'url': 'https://floatzel.net/pokemon/black-white/sprites/images/' + (/(unown).*/i.exec(pokemon.name.toLowerCase()) === 'unown' ? 201 : (pokemonNames.findIndex((name) => name === pokemon.name.toLowerCase() ? true : false) + 1)) + '.png'
            }
        }
    };

    channel.send(content, embed);
    channel.send('\n---------------------------------------');
    console.log('Pokemon: ' + pokemon.name + '\nNeighbourhood: ' + neighbourhoodName);
    console.log('-----------------------------------------------------------------');
    //console.log('Pokemon: ' + pokemon.name + ' (' + pokemonRole.name + ')' + '\nNeighbourhood: ' + neighbourhoodName + ' (' + neighbourhoodRole.name + ')');
}

function sendEmbedDM2(guild, neighbourhoodName, regex) {
    // Notes: Take input other than regex to account for different patterns (with/out IVs)
    const pokemon = {
        name: regex[1],
        iv: regex[2],
        cp: regex[3],
        level: regex[4],
        time: regex[5],
        stats: regex[6],
        moveset: regex[7],
        address: regex[8],
        maplink: regex[9].replace('>','')
    };

    //console.log(regex);

    let members = guild.members;

    const requiredRoleNames = [pokemon.name.toLowerCase(), neighbourhoodName];

    //`Pika-Pika! Wild ${pokemon.name} (IV: ${pokemon.iv} - CP: ${pokemon.cp} - LV: ${pokemon.level}) spawning in ${neighbourhoodName}! \nDetails: ${pokemon.address}`;

    let content = 'Pika-Pika! Wild ' + pokemon.name + ' (IV: ' + pokemon.iv + ' - CP: ' + pokemon.cp + ' - LV: ' + pokemon.level + ')' + ' spawning in ' + neighbourhoodName + '! \nDetails: ' + pokemon.address;

    const embed = {
        'embed': {
            title: 'Click here for directions to the wild ' + pokemon.name + '!\n',
            description: '**Neighbourhood:** ' + neighbourhoodName + '\n**Spawns Until:** ' + pokemon.time + '\n**Stats:** ' + pokemon.stats + ' (' + pokemon.iv + ')' + '\n**Moveset:** ' + pokemon.moveset + '\n**Address:** ' + pokemon.address,
            timestamp: new Date(),
            url: pokemon.maplink,
            color: 3066993,
            thumbnail: {
                'url': 'https://floatzel.net/pokemon/black-white/sprites/images/' + (/(unown).*/i.exec(pokemon.name.toLowerCase()) === 'unown' ? 201 : (pokemonNames.findIndex((name) => name === pokemon.name.toLowerCase() ? true : false) + 1)) + '.png'
            }
        }
    };

    let memberAlertsSent = 0;
    members.forEach(function (member) {

        //const hasRequiredRoles = member.roles.every(role => requiredRoleNames.includes(role.name));
        //or
        const hasPokemonRole = member.roles.some(role => pokemon.name.toLowerCase().includes(role.name));
        const hasUnownRole = member.roles.some(role => 'unown'.includes(role.name));
        const hasIV90Role = member.roles.some(role => 'iv90'.includes(role.name));
        const hasIV100Role = member.roles.some(role => 'iv100'.includes(role.name));
        const hasCP2500Role = member.roles.some(role => 'cp2500'.includes(role.name));
        const hasNeighbourhoodRole = member.roles.some(role => neighbourhoodName.includes(role.name));
        //const hasRequiredRoles = hasPokemonRole && hasNeighbourhoodRole;

        //console.log('memberIdMatch: ', member.id === "210950208421494797");
        //console.log('hasRequiredRoles: ', hasRequiredRoles);

        if (hasPokemonRole && hasNeighbourhoodRole) {
            memberAlertsSent = memberAlertsSent + 1;
            member.send(content, embed);
            return; // Skip to next iteration
            //guild.members.find('id', '210950208421494797').send(content, embed);
        }

        //console.log(hasUnownRole && /(unown).*/i.exec(pokemon.name.toLowerCase()) === 'unown');
        if (hasUnownRole && /(unown).*/i.exec(pokemon.name.toLowerCase())) {
            memberAlertsSent = memberAlertsSent + 1;
            member.send(content, embed);
            return; // Skip to next iteration
            //guild.members.find('id', '210950208421494797').send(content, embed);
        }

        if (hasIV100Role && hasNeighbourhoodRole && pokemon.iv.replace('%', '') >= 99) {
            if (!hasPokemonRole) { // Ensures member does not double DM for same post!
                memberAlertsSent = memberAlertsSent + 1;
                member.send(content, embed);
                return; // Skip to next iteration
                //guild.members.find('id', '210950208421494797').send(content, embed);
            }
        }

        if (hasIV90Role && hasNeighbourhoodRole && pokemon.iv.replace('%', '') >= 90) {
            if (!hasPokemonRole) { // Ensures member does not double DM for same post!
                memberAlertsSent = memberAlertsSent + 1;
                member.send(content, embed);
                return; // Skip to next iteration
                //guild.members.find('id', '210950208421494797').send(content, embed);
            }
        }

        if (hasCP2500Role && hasNeighbourhoodRole && pokemon.cp >= 2500) {
            if (!hasPokemonRole) { // Ensures member does not double DM for same post!
                memberAlertsSent = memberAlertsSent + 1;
                member.send(content, embed);
                return; // Skip to next iteration
                //guild.members.find('id', '210950208421494797').send(content, embed);
            }
        }

        // if (hasRequiredRoles) {
        //     memberAlertsSent = memberAlertsSent + 1;
        //     //member.send(content, embed);
        //     guild.members.find('id', '210950208421494797').send(content, embed);
        // } else if (pokemon.name.toLowerCase() === 'unown' && hasUnownRole) {
        //     memberAlertsSent = memberAlertsSent + 1;
        //     //member.send(content, embed);
        //     guild.members.find('id', '210950208421494797').send(content, embed);
        // }
    });

    console.log('Member Alerts Sent: ', memberAlertsSent);
    console.log('-----------------------------------------------------------------');
}