const mongoose = require('mongoose');
const configs = require('../../configs/configs');

const { Schema } = mongoose;

const MessengerChatSchema = Schema({
    discordChannel: { type: String, required: true },
    adminRole: { type: String, required: true },
    accessRole: { type: String, required: true },
});

module.exports = mongoose.model('MessengerChat', MessengerChatSchema, configs.dbMongo.schemaCollectionNames.messengerChat);
