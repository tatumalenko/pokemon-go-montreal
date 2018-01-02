const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const URL_PATH = 'mongodb://localhost:27017/pikachu'; // Connection URL
const DB_NAME = 'pikachu'; // Database Name
const COLLECTION_NAME = 'members';
//const du = require('./dbutils3');

const open = async() => {
    let client;

    try {
        // Use connect method to connect to the Server
        client = await MongoClient.connect(URL_PATH);

        const db = await client.db(DB_NAME);

        return {
            client,
            db
        };
    } catch (err) {
        console.log(err.stack);
    }

};

const close = async(client) => {
    if (client) {
        await client.close();
    }
};

// getFilteredMembers
const find = async(query, db, collectionName = COLLECTION_NAME) => {

    try {
        return await db.collection(collectionName).find(query).toArray();
    } catch (err) {
        console.log(err.stack);
    }
};

const addMember = async(member) => {
    // member.id, member.displayName
    const {
        client,
        db
    } = await open();

    // do something..

    close(client);
};

const removeMember = async(member) => {
    // member.id, member.displayName
    const {
        client,
        db
    } = await open();

    // do something..

    close(client);
};

const getFilters = async(memberId, db, collectionName = COLLECTION_NAME) => {
    try {
        const dbMember = await db.collection(collectionName).find({
            'id': memberId
        }).toArray();
        if (dbMember.length > 1)
            console.log('\nCAREFUL: mongoutils2.getFilters found two collection objects with same id field! Using first one found.\n');
        return dbMember[0].filters;
    } catch (err) {
        console.log(err.stack);
    }
};

/**---------------------------------------------------------------------------------------------
 * PIKACHU CALLS THESE FUNCTIONS
 *--------------------------------------------------------------------------------------------*/
const getFiltersStr = async(member) => {
    const memberId = member.id;

    try {
        const {
            client,
            db
        } = await open();

        const filters = await getFilters(memberId, db);

        await close(client);

        let strArr = [];
        for (filter of filters) {
            strArr.push(
                `Pokemon: ${filter.pokemon}
Neighbourhood: ${filter.neighbourhood}
Level: ${filter.level}
IV: ${filter.iv}`);

            // str += '\n\n';
        }

        return strArr.join('\n\n');
    } catch (err) {
        console.log(err.stack);
    }
}

// (async function () {
//     const query = {
//         'filters': {
//             $elemMatch: {
//                 pokemon: 'blissey',
//                 neighbourhood: {
//                     $in: ['plateau']
//                 },
//                 iv: {
//                     $lte: 91
//                 },
//                 level: {
//                     $lte: 21
//                 }
//             }
//         }
//     };

//     // const {
//     //     client,
//     //     db
//     // } = await open();
//     // console.log(db);
//     // console.log(await find(query, db));
//     // close(client);

//     // const {
//     //     client,
//     //     db
//     // } = await open();
//     // console.log(await getFilters('210950208421494797', db));
//     // close(client);

//     console.log(await getFiltersStr({
//         id: '210950208421494797'
//     }));
// })();

module.exports = {
    getFiltersStr
};