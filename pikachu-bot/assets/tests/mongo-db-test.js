const DB_URL_PATH = 'mongodb://localhost:27017/pikachu';
const COLLECTION_NAME = 'members';
const DOC_JSON_PATH = './mongo-doc.json';
process.on('unhandledRejection', console.error); // Nodejs config to better trace unhandled promise rejections


const open_test = async() => {
    try {
        const db = await open();
        await db.close();
    } catch (e) {
        console.error(e);
    }
};

const createCollection_test = async() => {
    try {
        const db = await open();
        console.log(await createCollection(COLLECTION_NAME, db));
        await db.close();
    } catch (e) {
        console.error(e);
    }
};

const insert_test = async() => {
    const docObj = require(DOC_JSON_PATH);

    try {
        const db = await open();
        console.log(await insert(docObj, COLLECTION_NAME, db));
        await db.close();
    } catch (e) {
        console.error(e);
    }
};

const find_test = async() => {
    const query = {
        username: 'uphillsimplex'
        // filters: {
        //     pokemon: 'tyranitar'
        // }
    };

    try {
        const db = await open();
        const res = await find(query, COLLECTION_NAME, db);
        console.log(res);
        await db.close();
    } catch (e) {
        console.error(e);
    }
};

//open_test();
//createCollection_test();
//insert_test();
find_test();


async function open(url = DB_URL_PATH) {
    const mongo = require('mongodb').MongoClient;

    try {
        return await mongo.connect(url);
    } catch (e) {
        console.error(e);
    }
}

async function createCollection(collectionName, db) {
    if (!db) db = await open();

    try {
        return await db.createCollection(collectionName);
    } catch (e) {
        console.error(e);
    }
}

async function insert(docObj, collectionName = COLLECTION_NAME, db) {
    if (!db) db = await open();

    try {
        return await db.collection(collectionName).insert(docObj); // docObj can be array of objects also
    } catch (e) {
        console.error(e);
    }
}

async function find(query, collectionName = COLLECTION_NAME, db) {
    if (!db) db = await open();

    try {
        return await db.collection(collectionName).find(query).toArray();
    } catch (e) {
        console.error(e);
    }
}