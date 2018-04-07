const { Client } = require('../../models/Client');

new Client({
    clientOptions: {
        fetchAllMembers: true,
    },
    name: 'pikachu',
    appDirName: __dirname,
    runIn: process.env.runIn ? process.env.runIn : ['bot-testing2', 'test-zone', 'wants-post', 'dm', 'secret-treehouse'], // = ['all'] for any channel
}).login();
