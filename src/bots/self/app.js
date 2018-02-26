// Import the discord.js module
const Discord = require('discord.js');
const auth = require('./auth.json');
const { createSpawn } = require('../assets/modules/botutils');

const WILD_IV0_IV90_CP2500_CHANNELS = ['iv0', 'iv90', 'cp2500'];
const WILD_GEN1_CHANNELS = ['aerodactyl', 'alakazam', 'arcanine', 'blastoise', 'chansey', 'charizard', 'dragonair', 'dragonite', 'dratini', 'exeggutor', 'flareon', 'gengar', 'golem', 'gyarados', 'hitmonchan', 'hitmonlee', 'jolteon', 'lapras', 'lickitung', 'machamp', 'muk', 'porygon', 'rhydon', 'snorlax', 'vaporeon', 'venusaur'];
const WILD_GEN2_CHANNELS = ['ampharos', 'blissey', 'donphan', 'feraligatr', 'flaaffy', 'forretress', 'hitmontop', 'larvitar', 'mareep', 'meganium', 'pupitar', 'togetic', 'typhlosion', 'tyranitar', 'unown'];
const WILD_GEN3_CHANNELS = ['armaldo', 'bagon', 'beldum', 'chimecho', 'cradily', 'feebas', 'kirlia', 'lairon', 'metang', 'shelgon', 'slakoth', 'trapinch', 'vigoroth'];

const WILD_CHANNELS = [...WILD_IV0_IV90_CP2500_CHANNELS, ...WILD_GEN1_CHANNELS, ...WILD_GEN2_CHANNELS, ...WILD_GEN3_CHANNELS];
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
            // console.log('-----------------------------------------------------------------');
            // console.log(message.content);
            // console.log('-----------------------------------------------------------------');

            // console.log('IV90_CP2500_CHANNELS.some(c => c === message.channel.name): ' + IV90_CP2500_CHANNELS.some(c => c === message.channel.name));


            // Attempt to dead-end listener if finds spawn name to have a named channel after itself to prevent double DMs
            if (IV90_CP2500_CHANNELS.some(c => c === message.channel.name.toLowerCase())) { // If this msg comes from iv90 or cp2500
                const spawn = createSpawn(message); // Create spawn to extract name using name method used in Pikachu

                console.log(`spawn.name.toLowerCase(): ${spawn.name.toLowerCase()}`);
                console.log(`WILD_CHANNELS.some(c => c === spawn.name.toLowerCase()): ${WILD_CHANNELS.some(c => c === spawn.name.toLowerCase().replace('\'', ''))}`);

                if (WILD_WITHOUT_GEN3_CHANNELS.some(c => c === spawn.name.toLowerCase().replace('\'', ''))) // If the spawn's name is in one of the wild channels
                { return; } // Dead-end listener knowing that another identical message will appear from the Pokemon's named channel
            }

            client.guilds.find('id', '352462877845749762').channels.find('name', 'discord-income').send(message.content);
        } else if (message.guild.name === 'MontrealPokeMap' && RAID_CHANNELS.some(c => c === message.channel.name)) {
            // console.log('-----------------------------------------------------------------');
            // console.log(message.content);
            // console.log('-----------------------------------------------------------------');
            client.guilds.find('id', '352462877845749762').channels.find('name', 'raids-income').send(message.content);
        }
    } catch (e) {
        console.log(e);
        // client.guilds.find('id', '352462877845749762').channels.find('name', 'discord-income').send(message.content);
    }
});

// Login bot
client.login(auth.token);
