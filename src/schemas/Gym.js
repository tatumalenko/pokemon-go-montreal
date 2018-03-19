const mongoose = require('mongoose');
const _ = require('lodash');
const Utils = require('../utils/Utils');
const configs = require('../../configs/configs');

const { Schema } = mongoose;

const GymSchema = Schema({
    name: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    neighbourhood: { type: String, required: true },
    eligible: { type: Boolean, required: true },
});

module.exports = mongoose.model('Gym', GymSchema, configs.dbMongo.schemaCollectionNames.gym);
