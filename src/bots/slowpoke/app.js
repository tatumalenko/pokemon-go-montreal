process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

const { Client } = require('../../models/Client');

new Client({
    clientOptions: {
        fetchAllMembers: true,
    },
    name: 'slowpoke',
    appDirName: __dirname,
    runIn: process.env.runIn ? process.env.runIn : ['all'], // = ['all'] for any channel
}).login();
