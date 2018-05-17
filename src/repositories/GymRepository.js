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

    async fetchAllGyms() {
        const gyms = await Gym.find();

        return gyms;
    }

    async searchByName(text) {
        const gyms = await Gym.find(
            { $text: { $search: text } },
            // eslint-disable-next-line comma-dangle
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } });

        return gyms;
    }

    async fetchEligibleGyms() {
        const gyms = Gym.where('eligible', true).find();

        return gyms;
    }
}

module.exports = RaidRepository;
