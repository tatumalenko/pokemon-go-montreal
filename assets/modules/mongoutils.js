const DB_URL_PATH = 'mongodb://localhost:27017/pikachu';
const COLLECTION_NAME = 'members';
const du = require('./dbutils3');
//process.on('unhandledRejection', console.error); // Nodejs config to better trace unhandled promise rejections

const MongoClient = require('mongodb').MongoClient;

const query = {
    'filters': {
        $elemMatch: {
            pokemon: 'blissey',
            neighbourhood: {
                $in: ['plateau']
            },
            iv: {
                $lte: 91
            },
            level: {
                $lte: 21
            }
        }
    }
};

async function test() {
    //await convert();
    const db = await open();
    const res = await find(query, COLLECTION_NAME, db);

    console.log(res.map(e => e.username));
}



async function test_open() {
    const db = await open();
    console.log(db);
}

(async function () {
    try {
        test2();
    } catch (err) {
        console.log(err.stack);
    }
})();

async function convert() {
    const sqldb = await du.getTable();
    let docArray = [];
    //console.log(sqldb[0]);

    for (const member of sqldb) {
        let filters = [];

        //console.log(member);
        for (const filter of member.pokemon.split(',')) {
            let tempFilter;
            const curNeigh = member.neighbourhood.split(',') == '' ? [] : member.neighbourhood.split(',');

            switch (filter) {
                case 'iv90':
                    tempFilter = {
                        pokemon: 'all',
                        neighbourhood: curNeigh,
                        iv: 90,
                        level: 0,
                        cp: 0
                    };
                    break;
                case 'iv95':
                    tempFilter = {
                        pokemon: 'all',
                        neighbourhood: curNeigh,
                        iv: 95,
                        level: 0,
                        cp: 0
                    };
                    break;
                case 'iv97':
                    tempFilter = {
                        pokemon: 'all',
                        neighbourhood: curNeigh,
                        iv: 97,
                        level: 0,
                        cp: 0
                    };
                    break;
                case 'iv100':
                    tempFilter = {
                        pokemon: 'all',
                        neighbourhood: curNeigh,
                        iv: 100,
                        level: 0,
                        cp: 0
                    };
                    break;
                case 'iv90lv30':
                    tempFilter = {
                        pokemon: 'all',
                        neighbourhood: curNeigh,
                        iv: 90,
                        level: 30,
                        cp: 0
                    };
                    break;
                case 'iv90lv25':
                    tempFilter = {
                        pokemon: 'all',
                        neighbourhood: curNeigh,
                        iv: 90,
                        level: 25,
                        cp: 0
                    };
                    break;
                case 'iv95lv25':
                    tempFilter = {
                        pokemon: 'all',
                        neighbourhood: curNeigh,
                        iv: 95,
                        level: 25,
                        cp: 0
                    };
                    break;
                case 'cp2500':
                    tempFilter = {
                        pokemon: 'all',
                        neighbourhood: curNeigh,
                        iv: 0,
                        level: 0,
                        cp: 2500
                    };
                    break;
                case 'unown':
                    tempFilter = {
                        pokemon: 'unown',
                        neighbourhood: 'all',
                        iv: 0,
                        level: 0,
                        cp: 0
                    };
                    break;
                default:
                    if (filter)
                        tempFilter = {
                            pokemon: filter,
                            neighbourhood: curNeigh,
                            iv: 0,
                            level: 0,
                            cp: 0
                        };

                    break;
            }

            if (tempFilter)
                filters.push(tempFilter);
        }

        let doc = {
            id: member.id,
            username: member.nickname,
            filters: filters
        };

        docArray.push(doc);
    }

    const db = await open();
    const res = await insert(docArray, COLLECTION_NAME, db);
    await db.close();
    console.log(res);
}

async function open(url = DB_URL_PATH) {
    const mongo = require('mongodb').MongoClient;

    try {
        const client = await mongo.connect(url);
        return await client.db('pikachu');
    } catch (e) {
        console.log(e);
    }
}

async function createCollection(collectionName, db) {
    if (!db) db = await open();

    try {
        return await db.createCollection(collectionName);
    } catch (e) {
        console.log(e);
    }
}

async function insert(docObj, collectionName = COLLECTION_NAME, db) {

    try {
        return await db.collection(collectionName).insert(docObj); // docObj can be array of objects also
    } catch (e) {
        console.log(e);
    }
}

async function find(query, collectionName = COLLECTION_NAME, db) {

    try {
        return await db.collection(collectionName).find(query).toArray();
    } catch (e) {
        console.log(e);
    }
}