/*
 * Database Utility Functions
 */

module.exports = {
    getTable
};

const sqlite = require('sqlite');

const path = require('path');

const MEMBER_DATABASE_PATH = path.join(__dirname, '..', 'db', 'database.db');

async function getTable() {

    const db = await open();

    const sql = 'SELECT * ' +
        'FROM members';

    const table = await db.all(sql);

    await db.close();

    return table;
}

async function open(dbPath = MEMBER_DATABASE_PATH) {
    const db = await sqlite.open(dbPath, {
        Promise
    });
    //console.log('Opens here!');
    return db;
}