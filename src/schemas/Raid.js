const mongoose = require('mongoose');
const _ = require('lodash');
const Utils = require('../utils/Utils');
const configs = require('../../configs/configs');

const { Schema } = mongoose;

const RaidSchema = Schema({
    tier: { type: Number, required: true },
    name: { type: String, required: true },
    fastMove: { type: String, required: false },
    chargeMove: { type: String, required: false },
    ending: { type: Date, required: true },
    gym: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    address: { type: String, required: true },
});

module.exports = mongoose.model('Raid', RaidSchema, configs.dbMongo.schemaCollectionNames.raid);
