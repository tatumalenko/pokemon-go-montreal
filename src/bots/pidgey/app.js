const { Client } = require('../../models/Client');

const client = new Client({
    name: 'pidgey',
    appDirName: __dirname,
    runIn: ['bot-testing'], // = ['all'] for any channel
}).login();
