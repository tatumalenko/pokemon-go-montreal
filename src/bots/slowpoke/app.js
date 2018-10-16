process.on('uncaughtException', async (e) => {
    console.error(e);
    await this.client.logger.logError(`${process.env.name}: ${e.message}`);
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
