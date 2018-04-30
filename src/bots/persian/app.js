const { Client } = require('../../models/Client');

const client = new Client({
    name: 'persian',
    appDirName: __dirname,
    runIn: ['bot-testing', 'test-zone', 'dm', 'secret-treehouse'], // = ['all'] for any channel
}).login();
