const { Client } = require('../../models/Client');

var client = new Client({
    /*clientOptions: {
        fetchAllMembers: true,
    },*/
    name: 'persian',
    appDirName: __dirname,
    runIn: ['bot-testing', 'test-zone', 'dm'], // = ['all'] for any channel
}).login();