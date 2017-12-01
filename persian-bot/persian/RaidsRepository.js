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
        var collectionName = this.raidsCollection;
        MongoClient.connect(this.connectionString, function (err, db) {
            var collection = db.collection(collectionName);
            // TODO: Fix wrong date in database.
            collection.insertOne(raid, function (err, r) {
                if (err) {
                    console.log("Error:" + err);
                }
            });
            db.close();
        });
    }

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