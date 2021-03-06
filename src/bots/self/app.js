// Import the discord.js module
const Discord = require('discord.js');
const configs = require('../../../configs/configs');
const { createWildSpawnParams } = require('../../utils/Utils');

const WILD_IV0_IV90_CP2500_CHANNELS = ['iv0', 'iv90', 'cp2500'];
const WILD_GEN1_CHANNELS = ['aerodactyl', 'alakazam', 'arcanine', 'blastoise', 'chansey', 'charizard', 'dragonair', 'dragonite', 'dratini', 'exeggutor', 'flareon', 'gengar', 'golem', 'gyarados', 'hitmonchan', 'hitmonlee', 'jolteon', 'lapras', 'lickitung', 'machamp', 'muk', 'porygon', 'rhydon', 'snorlax', 'vaporeon', 'venusaur'];
const WILD_GEN2_CHANNELS = ['ampharos', 'blissey', 'donphan', 'feraligatr', 'flaaffy', 'forretress', 'hitmontop', 'larvitar', 'mareep', 'meganium', 'pupitar', 'togetic', 'typhlosion', 'tyranitar', 'unown'];
const WILD_GEN3_CHANNELS = ['armaldo', 'bagon', 'beldum', 'chimecho', 'cradily', 'feebas', 'kirlia', 'lairon', 'metang', 'shelgon', 'slakoth', 'trapinch', 'vigoroth'];
const WILD_NAMED_POKEMON_CHANNELS = [...WILD_GEN1_CHANNELS, ...WILD_GEN2_CHANNELS, ...WILD_GEN3_CHANNELS];

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
    console.log(`${client.user.tag}, Ready to serve ${client.guilds.size} guilds and ${client.users.size} users`);
    console.log('-----------------------------------------------------------------');
});

client.on('error', console.error);

// Create an event listener for the Map Discord
// Using the channel name array constant to identify which channel to
// use for importing the messages into our own server's channel
client.on('message', async (message) => {
    try {
        if (message.guild.name === 'Pokedex100' && ['level30community'].some(c => c === message.channel.name)) {
            if (/:flag_ca:/.exec(message)) {
                await client.guilds.find(guild => guild.id === configs.guildId).channels.find(channel => channel.name === 'discord-income').send(message.content.replace(/@/g, ''));
            }
        }

        // if (message.guild.name === 'MontrealPokeMap' && WILD_CHANNELS.some(c => c === message.channel.name)) {
        //     // console.log('-----------------------------------------------------------------');
        //     // console.log(message.content);
        //     // console.log('-----------------------------------------------------------------');
        //     // console.log('IV90_CP2500_CHANNELS.some(c => c === message.channel.name): ' + IV90_CP2500_CHANNELS.some(c => c === message.channel.name));

        //     // Attempt to dead-end listener if finds spawn name to have a named channel after itself to prevent double DMs
        //     if (WILD_IV0_IV90_CP2500_CHANNELS.some(c => c === message.channel.name.toLowerCase())) { // If this msg comes from iv90 or cp2500
        //         const spawn = createWildSpawnParams(message); // Create spawn to extract name using name method used in Pikachu

        //         // console.log(`spawn.name.toLowerCase(): ${spawn.name.toLowerCase()}`);
        //         // console.log(`WILD_CHANNELS.some(c => c === spawn.name.toLowerCase()): ${WILD_CHANNELS.some(c => c === spawn.name.toLowerCase().replace('\'', ''))}`);

        //         // Dead-end listener knowing that another identical message will appear from the Pokemon's named channel
        //         if (WILD_NAMED_POKEMON_CHANNELS.some(c => c === spawn.name.toLowerCase().replace('\'', ''))) { return; }// If the spawn's name is in one of the wild channels
        //     }

        //     await client.guilds.find('id', configs.guildId).channels.find('name', 'discord-income').send(message.content);
        // } else if (message.guild.name === 'MontrealPokeMap' && RAID_CHANNELS.some(c => c === message.channel.name)) {
        //     // console.log('-----------------------------------------------------------------');
        //     // console.log(message.content);
        //     // console.log('-----------------------------------------------------------------');
        //     await client.guilds.find('id', configs.guildId).channels.find('name', 'raids-income').send(message.content);
        // } else if (message.guild.id === configs.guildId) {
        //     let args = message.content.substring(1).split(' ');
        //     const cmd = args[0];
        //     args = args.splice(1);
        //     // '!server restart self'
        //     if (cmd !== 'server') { return; }
        //     if (!message.member.roles.some(role => role.name === 'admin' || role.name === 'mod' || role.name === 'mega-bot')) {
        //         await message.channel.send('You do not have permission for this command! You n\'avez pas la permissions d\'utiliser cette commande!');
        //         return;
        //     }
        //     if (args.length === 2 && (args[0].toLowerCase() === 'restart') && (args[1].toLowerCase() === process.env.name)) {
        //         await message.channel.send('Got it! Restarting now...');
        //         process.exit(1);
        //     }
        //     return;
        // }
    } catch (e) {
        console.error(e);
        // await this.client.logger.logInfo(`${process.env.name}.${this.name}: ${e.message}`);
    }
});

// Login bot
client.login(configs['self-bot'].botToken);
