const { Client } = require('../../models/Client');

const client = new Client({
    name: 'pidgey',
    appDirName: __dirname,
    runIn: ['bot-testing', 'nest-discussion'], // = ['all'] for any channel
}).login();
