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
        errorLogs: 'error-logs',
        announcementPost: 'announcement-post',
    },
    rootDirPath: process.cwd(),
    cmdPrefix: '!',
    dbMongo: {
        dbPath: process.env.MONGO_DB_PATH,
        schemaCollectionNames: {
            user: 'users',
            raid: 'raids',
            gym: 'gyms',
            messengerChat: 'messengerChats',
        },
    },
    TSR: {
        getNestURL: 'https://thesilphroad.com/atlas/getLocalNests.json',
        postData: {
            data: {
                lat1: 45.71505275353951,
                lng1: -74.02232029875363,
                lat2: 45.39863265258384,
                lng2: -73.2820990142938,
                zoom: 10.587602669228598,
                mapFilterValues: {
                    mapTypes: [1],
                    nestVerificationLevels: [1],
                    nestTypes: [-1],
                },
                center_lat: 45.55706542339709,
                center_lng: -73.65220965652816,
            },
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
        webhookId: process.env.WEBHOOK_ID,
        webhookToken: process.env.WEBHOOK_TOKEN,
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token_key: process.env.ACCESS_TOKEN_KEY,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET,
        userIds: ['2839430431', '783281708137324549', '4840958511', '849344094681870336', '816666530318524416'],
    },
    'self-bot': {
        clientId: process.env.CLIENT_ID,
        botToken: process.env.BOT_TOKEN,
    },
    persian: {
        clientId: process.env.CLIENT_ID,
        botToken: process.env.BOT_TOKEN,
        gymManagementAllowedRoles: ['admin'],
        chats: {
            globalAdminRole: 'admin',
            managementChannel: '455905163526275094',
        },
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
