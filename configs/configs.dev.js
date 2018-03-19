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
        clientId: '360755167953682432',
        botToken: 'MzYwNzU1MTY3OTUzNjgyNDMy.DKtMdg.B-Un1hzaDeXk0pe6KVt-BZ5q6ZQ',
    },
    slowpoke: {
        clientId: '359610082457288706',
        botToken: 'MzU5NjEwMDgyNDU3Mjg4NzA2.DKJgkQ.elGGht2B_zLaleHVCFV-y_hMAOw',
    },
    'professor-willow': {
        clientId: '380373659493335042',
        botToken: 'MzgwMzczNjU5NDkzMzM1MDQy.DO3qGg.kx5pjOVZDy2AIlxALq83xO_wCKQ',
    },
    'self-bot': {
        clientId: '',
        botToken: 'MzUyODkxMzA5MDI0ODcwNDAz.DLOHrA.OQmvHa88PRfzLMmPWBdoydNv_RU',
    },
    twitter: {
        webhookId: '360757582253654016',
        webhookToken: 'foX4zyICueXC9sgaqVN4qcnV3bWgXwayZ9UCOjGZaFWj-n51MonhUzchTTx0cfDcMEJ9',
        consumer_key: 'W9zZScb5eDIERWYnMIzMIynwk',
        consumer_secret: 'etd9MEj8m11CkXIA77vwVwI8vhYBCYfQC4dlhMftt96q2wwl0K',
        access_token_key: '943808102549336064-0P7fv6egC1203BfpRy2YazjRlygR5A8',
        access_token_secret: 'f9GsuXmpiJ4hBBYS6jJQgRbo9QqMCBNNzrPj1T8Pendxp',
        userIds: ['2839430431', '783281708137324549', '4840958511', '849344094681870336', '816666530318524416'],
    },
    persian: {
        clientId: '',
        // botToken: 'Mzg2Mjk3MTMxOTQ3Nzg2MjQw.DQN3mg.9u5CJ_lv9hWOwdIW7StQirTWuvM',
        botToken: 'MzgwOTA0NzY0MTUxNTYyMjQ3.DO_YuQ.J07Q1y9ZQlVcEt7xve8mDRFIzrA',
    },
    meowth: {
        clientId: '406662051948265474',
        botToken: 'NDA2NjYyMDUxOTQ4MjY1NDc0.DU2Nkg.MAyjWS6TDNXzKGqmE-gB1m_ddMA',
    },
};
