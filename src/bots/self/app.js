// Import the discord.js module
const Discord = require('discord.js');
const auth = require('./auth.json');
const createSpawn = require('../assets/modules/botutils').createSpawn;

const IV90_CP2500_CHANNELS = ['iv90', 'cp2500'];
const ULTRA_RARE_CHANNELS = ['unown', 'tyranitar', 'dragonite', 'blissey', 'chansey', 'farfetchd'];
const VERY_RARE_CHANNELS = ['snorlax', 'lapras', 'mareep', 'flaaffy', 'ampharos', 'larvitar', 'pupitar', 'togetic'];
const RARE_CHANNELS = // Excluding Eevee evolutions
    ['alakazam', 'blastoise', 'charizard', 'donphan', 'exeggutor', 'feraligatr', 'gengar', 'golem', 'gyarados',
        'hitmonlee', 'hitmonchan', 'hitmontop', 'lickitung', 'machamp', 'meganium', 'miltank', 'muk', 'porygon',
        'rhydon', 'typhlosion', 'venusaur'
    ];
const GEN3_CHANNELS = ['grovyle', 'sceptile', 'combusken', 'blaziken', 'marshtomp', 'swampert', 'mightyena', 'ralts', 'kirlia', 'gardevoir', 'slakoth', 'vigoroth', 'slaking'];

const EEVEE_EVOLUTIONS_CHANNELS = ['flareon', 'jolteon', 'vaporeon'];

const WILD_CHANNELS = IV90_CP2500_CHANNELS.concat(ULTRA_RARE_CHANNELS, VERY_RARE_CHANNELS, RARE_CHANNELS, EEVEE_EVOLUTIONS_CHANNELS, GEN3_CHANNELS);
const WILD_WITHOUT_GEN3_CHANNELS = IV90_CP2500_CHANNELS.concat(ULTRA_RARE_CHANNELS, VERY_RARE_CHANNELS, RARE_CHANNELS, EEVEE_EVOLUTIONS_CHANNELS);

const RAID_CHANNELS = ['raid-level-4', 'raid-legendary'];
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
    console.log('-----------------------------------------------------------------');
});

// Create an event listener for the Map Discord
// Using the channel name array constant to identify which channel to 
// use for importing the messages into our own server's channel
client.on('message', (message) => {
    try {
        if (message.guild.name === 'MontrealPokeMap' && WILD_CHANNELS.some(c => c === message.channel.name)) {
            //console.log('-----------------------------------------------------------------');
            //console.log(message.content);
            //console.log('-----------------------------------------------------------------');

            //console.log('IV90_CP2500_CHANNELS.some(c => c === message.channel.name): ' + IV90_CP2500_CHANNELS.some(c => c === message.channel.name));


            // Attempt to dead-end listener if finds spawn name to have a named channel after itself to prevent double DMs
            if (IV90_CP2500_CHANNELS.some(c => c === message.channel.name.toLowerCase())) { // If this msg comes from iv90 or cp2500
                const spawn = createSpawn(message); // Create spawn to extract name using name method used in Pikachu

                console.log('spawn.name.toLowerCase(): ' + spawn.name.toLowerCase());
                console.log('WILD_CHANNELS.some(c => c === spawn.name.toLowerCase()): ' + WILD_CHANNELS.some(c => c === spawn.name.toLowerCase().replace('\'', '')));

                if (WILD_WITHOUT_GEN3_CHANNELS.some(c => c === spawn.name.toLowerCase().replace('\'', ''))) // If the spawn's name is in one of the wild channels
                    return; // Dead-end listener knowing that another identical message will appear from the Pokemon's named channel
            }

            client.guilds.find('id', '352462877845749762').channels.find('name', 'discord-income').send(message.content);
        } else if (message.guild.name === 'MontrealPokeMap' && RAID_CHANNELS.some(c => c === message.channel.name)) {
            //console.log('-----------------------------------------------------------------');
            //console.log(message.content);
            //console.log('-----------------------------------------------------------------');
            client.guilds.find('id', '352462877845749762').channels.find('name', 'raids-income').send(message.content);
        }
    } catch (e) {
        console.log(e);
        //client.guilds.find('id', '352462877845749762').channels.find('name', 'discord-income').send(message.content);
    }
});

// Login bot
client.login(auth.token);