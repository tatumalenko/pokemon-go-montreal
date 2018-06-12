const mongoose = require('mongoose');
const MessengerChat = require('../schemas/MessengerChat');

class MessengerChatRepository {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
        this.init();
    }

    async init() {
        try {
            mongoose.connect(this.dbPath, { useMongoClient: true });
            mongoose.Promise = global.Promise;
            this.db = mongoose.connection;
            this.db.on('error', console.error.bind(console, 'MongoDB connection error:'));
        } catch (err) {
            console.log(err);
        }
    }

    close() {
        if (this.client) { this.client.close(); }
    }

    async update(messengerChat) {
        await MessengerChat.update({
            discordChannel: messengerChat.discordChannel,
        }, messengerChat, { upsert: true });
    }

    async fetchAll() {
        const chats = await MessengerChat.find();

        return chats;
    }

    async deleteAll() {
        await MessengerChat.deleteMany();
    }
}

module.exports = MessengerChatRepository;
