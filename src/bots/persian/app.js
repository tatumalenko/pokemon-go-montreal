const { Client } = require('../../models/Client');

const client = new Client({
    name: 'persian',
    appDirName: __dirname,
    runIn: ['bot-testing', 'test-zone', 'dm', 'secret-treehouse', 'messenger-admins'], // = ['all'] for any channel
}).login();
