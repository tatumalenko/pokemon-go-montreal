const Raid = require("./Raid.js");
const MongoClient = require('mongodb').MongoClient;

class RaidsRepository {
    constructor(connectionString, raidsCollection) {
        this.connectionString = connectionString;
        this.raidsCollection = raidsCollection;
    }

    /**
     * Add a raid in our database.
     * @param {Raid} raid
     */
    ReportRaid(raid) {
        console.log("Adding raid");
        var collectionName = this.raidsCollection;
        MongoClient.connect(this.connectionString, function (err, db) {
            var collection = db.collection(collectionName);
            collection.insertOne(raid, function (err, r) {
                if (err) {
                    console.log("Error:" + err);
                }
            });
            db.close();
        });
    }

    /**
     * Remove a raid at the same location from our storage.
     * @param {Raid} raid
     */
    async RemoveEquivalent(raid) {
        console.log("Removing potential equivalent");
        var existingRaid;
        await this.GetRaid(raid.latitude, raid.longitude).then(function(raidFound) {
            existingRaid = raidFound;
        });

        if (typeof existingRaid !== "undefined") {
            this.RemoveRaid(existingRaid);
        }
    }

    /**
     * Get all current raids from the database. This method is for testing purposes only.
     */
    async GetAllRaids() {
        var raids = [];

        var collectionName = this.raidsCollection;
        var result = await MongoClient.connect(this.connectionString).then(async(db) => {
            var collection = db.collection(collectionName);
            
            var raidObjects = await collection.find().toArray();
            await raidObjects.forEach(raidObject => {
                raids.push(new Raid(raidObject));
            });
            db.close();
        });

        return raids;
    }

    /**
     * Get a raid from a location.
     * @param {*} lat
     * @param {*} long
     */
    async GetRaid(lat, long) {
        var raid;
        var collectionName = this.raidsCollection;
        var result = await MongoClient.connect(this.connectionString).then(async(db) => {
            var collection = db.collection(collectionName);

            var raidObjects = await collection.find({latitude:String(lat),longitude:String(long)}).toArray();
            if (raidObjects.length > 0) {
                raid = new Raid(raidObjects[0]);
            }

            db.close();
        });

        return raid;
    }

    /**
     * Remove a raid from our database. unique key is "originId".
     * @param {Raid} raid 
     */
    RemoveRaid(raid) {
        console.log("Removing " + raid.originId);
        var collectionName = this.raidsCollection;
        MongoClient.connect(this.connectionString, function (err, db) {
            var collection = db.collection(collectionName);
            collection.deleteOne({"originId":raid.originId}, function (err, r) {
                if (err) {
                    console.log("Error:" + err);
                }
            });
            db.close();
        });
    }
}

module.exports = RaidsRepository;