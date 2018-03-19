const mongoose = require('mongoose');
const Gym = require('../schemas/Gym');
const RaidSpawn = require('../models/RaidSpawn');


class RaidRepository {
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

    async addUpdateGym(gym) {
        await Gym.update({
            latitude: gym.latitude,
            longitude: gym.longitude,
        }, gym, { upsert: true });
    }
}

module.exports = RaidRepository;
