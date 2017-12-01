// Point to relative path of database file with member data
//const MEMBER_DATABASE_PATH = '../db/database.db';
//const MEMBER_DATABASE_PATH = './database.db';
const MEMBER_DATABASE_PATH = '/Users/tatumalenko/Documents/Code/discord/pikachu-bot/assets/db/database.db';
//const MEMBER_DATABASE_PATH = './db/testing.db';
//'../db/database.db'

// Import the sqlite module
const sqlite = require('sqlite');

const path = require('path');

console.log(path.join(__dirname, '..', 'db', 'database.db'));

const test = async() => {
    const db = await open();

    console.log(await getFilters(db, '210950208421494797'));
};

test();

async function open(dbPath = MEMBER_DATABASE_PATH) {
    const db = await sqlite.open(dbPath, {
        Promise
    });
    //console.log('Opens here!');
    return db;
}

async function getFilters(db, memberId) {

    if (!db)
        db = await open();

    const sql = 'SELECT pokemon pokemon, neighbourhood neighbourhood ' +
        'FROM members ' +
        'WHERE id = ?';

    const filters = await db.get(sql, memberId);

    filters.pokemon = filters.pokemon.split(',').sort();
    filters.neighbourhood = filters.neighbourhood.split(',').sort();

    return filters;
}