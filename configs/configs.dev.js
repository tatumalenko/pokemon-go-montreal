const path = require('path');

module.exports = {
    guildId: '352462877845749762',
    channels: {
        adminMods: 'secret-treehouse',
        joinTeam: 'welcome',
        pokedex: 'pokedex',
        launchRaid: 'raids-post',
        wildAlerts: 'wilds-post',
        manageWildAlerts: 'wants-post',
        manageRaidAlerts: '',
        botTesting: 'bot-testing',
        botLogs: 'bot-logs',
        announcementPost: 'announcement-post',
    },
    rootDirPath: process.cwd(),
    cmdPrefix: '!',
    dbMongo: {
        dbPath: 'mongodb://localhost:27017/pokemongo',
        schemaCollectionNames: {
            user: 'users',
            raid: 'raids',
            gym: 'gyms',
        },
    },
    polygonMapPath: path.join(process.cwd(), '../../../data/neighbourhoodPolygons.kml'),

    pikachu: {
        clientId: process.env.CLIENT_ID,
        botToken: process.env.BOT_TOKEN,
    },
    slowpoke: {
        clientId: process.env.CLIENT_ID,
        botToken: process.env.BOT_TOKEN,
    },
    'professor-willow': {
        clientId: process.env.CLIENT_ID,
        botToken: process.env.BOT_TOKEN,
    },
    'self-bot': {
        clientId: process.env.CLIENT_ID,
        botToken: process.env.BOT_TOKEN,
    },
    twitter: {
        webhookId: process.env.WEBHOOK_ID,
        webhookToken: process.env.WEBHOOK_TOKEN,
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token_key: process.env.ACCESS_TOKEN_KEY,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET,
        userIds: ['2839430431', '783281708137324549', '4840958511', '849344094681870336', '816666530318524416'],
    },
    persian: {
        clientId: process.env.CLIENT_ID,
        botToken: process.env.BOT_TOKEN,
    },
    pidgey: {
        clientId: process.env.CLIENT_ID,
        botToken: process.env.BOT_TOKEN,
    },
    meowth: {
        clientId: process.env.CLIENT_ID,
        botToken: process.env.BOT_TOKEN,
    },
};
