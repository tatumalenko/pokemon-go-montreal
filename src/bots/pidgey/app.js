process.on('uncaughtException', async (e) => {
    console.error(e);
    await this.client.logger.logError(`${process.env.name}: ${e.message}`);
});

const { Client } = require('../../models/Client');

const client = new Client({
    name: 'pidgey',
    appDirName: __dirname,
    runIn: ['bot-testing', 'nest-discussion'], // = ['all'] for any channel
}).login();
