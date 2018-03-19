const mongoose = require('mongoose');
const Raid = require('../schemas/Raid');
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

    async addRaid(raid) {
        await Raid.update({
            latitude: raid.latitude,
            longitude: raid.longitude,
        }, {
            tier: raid.tier,
            name: raid.name,
            fastMove: raid.moveset.fast,
            chargeMove: raid.moveset.charge,
            ending: raid.time.ending,
            gym: raid.gym,
            eligible: raid.eligible,
            latitude: raid.location.coordinates.latitude,
            longitude: raid.location.coordinates.longitude,
            address: raid.location.address,
        }, { upsert: true });
    }
}

module.exports = RaidRepository;
