const { Client } = require('../../models/Client');

const client = new Client({
    name: 'delibird',
    appDirName: __dirname,
    runIn: ['bot-testing'], // = ['all'] for any channel
}).login();
