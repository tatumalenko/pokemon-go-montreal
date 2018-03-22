const { Client } = require('../../models/Client');

new Client({
    clientOptions: {
        fetchAllMembers: true,
    },
    name: 'pikachu',
    appDirName: __dirname,
    runIn: ['bot-testing2', 'test-zone', 'wants-post', 'dm'], // = ['all'] for any channel
}).login();
