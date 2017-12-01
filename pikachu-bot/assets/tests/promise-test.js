/**---------------------------------------------------------------------------------------------
 * IMPORT MODULES
 *--------------------------------------------------------------------------------------------*/
// Import the discord.js module
const Discord = require('discord.js');
const auth = require('../../auth.json');

const client = new Discord.Client({
    fetchAllMembers: true
}); // Create an instance of a Discord client

//process.on('unhandledRejection', console.error);

/**---------------------------------------------------------------------------------------------
 * EVENT: READY
 *--------------------------------------------------------------------------------------------*/
client.on('ready', async() => {
    console.log('-----------------------------------------------------------------');
    console.log('I am ready!');
    console.log('-----------------------------------------------------------------');

    const uphill = client.guilds.find('id', '352462877845749762').members.find('id', '210950208421494797');

    uphill.send('');
    //console.log(uphill);

});

// Login bot
client.login(auth.token);