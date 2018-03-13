const path = require('path');

module.exports = {
    guildId: '352462877845749762',
    rootDirPath: process.cwd(),
    cmdPrefix: '!',
    dbMongo: {
        dbPath: 'mongodb://localhost:27017/pikachu',
        schemaCollectionNames: {
            user: 'users',
            raid: 'raids',
        },
    },
    polygonMapPath: path.join(process.cwd(), '../../../data/neighbourhoodPolygons.kml'),

    pikachu: {
        clientId: '360755167953682432',
        botToken: 'MzYwNzU1MTY3OTUzNjgyNDMy.DKtMdg.B-Un1hzaDeXk0pe6KVt-BZ5q6ZQ',
    },
    slowpoke: {
        clientId: '',
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
    },
    persian: {
        clientId: '',
        botToken: 'Mzg2Mjk3MTMxOTQ3Nzg2MjQw.DQN3mg.9u5CJ_lv9hWOwdIW7StQirTWuvM',
    },
    meowth: {
        clientId: '406662051948265474',
        botToken: 'NDA2NjYyMDUxOTQ4MjY1NDc0.DU2Nkg.MAyjWS6TDNXzKGqmE-gB1m_ddMA',
    },
};
