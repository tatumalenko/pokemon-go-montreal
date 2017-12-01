/*
 * Database Utility Functions  
 */

module.exports = {
    getPokemons,
    getNeighbourhoods,
    getPolygons,
    getTranslation,
    getEnglishName,
    isValidFilter,
    getFilters,
    hasFilter,
    hasEveryFilter,
    addFilter,
    removeFilter,
    setFilters,
    getFilteredMembers,
    createTableFromRoles,
    addMember,
    removeMember,
    getTable
};

// Other pokemon conditional filters
const POKEMON_CONDITIONAL_FILTERS = ['iv90', 'iv100', 'cp2500', 'iv90lv30', 'iv90lv25', 'iv95lv25'];

// Import the sqlite module
const sqlite = require('sqlite');

const path = require('path');

// Point to relative path of database file with member data
//const MEMBER_DATABASE_PATH = '../db/database.db';
//const MEMBER_DATABASE_PATH = './database.db';
//const MEMBER_DATABASE_PATH = '/Users/tatumalenko/Documents/Code/discord/pikachu-bot/assets/db/database.db';
//const MEMBER_DATABASE_PATH = './db/testing.db';
const MEMBER_DATABASE_PATH = path.join(__dirname, '..', 'db', 'database.db');

// Import the togeojson and fs module
const tj = require('togeojson'),
    fs = require('fs'),
    DOMParser = require('xmldom').DOMParser;

// Import the pkmn.json static database file
const pkmndict = require('../data/pkmn.json');
const pkmndict_fr = require('../data/pkmn_fr.json');

const Diacritics = require('diacritic');

async function createTableFromRoles(members) {

    const db = await open();

    await db.run('CREATE TABLE IF NOT EXISTS members (id TEXT, nickname TEXT, pokemon TEXT, neighbourhood TEXT)');

    members.forEach(async(member) => {
        const fr = filterRoles(member, getNeighbourhoods());

        const params = [member.id,
            member.displayName,
            fr.pokemon.join(','),
            fr.neighbourhood.join(',')
        ];
        await db.run('INSERT INTO members(id, nickname, pokemon, neighbourhood) VALUES ' +
            '(?,?,?,?)', params);
    });

    db.close();
}

async function addMember(member) {
    const db = await open();

    await db.run('INSERT INTO members(id, nickname, pokemon, neighbourhood) VALUES ' +
        '(?,?,?,?)', [member.id, member.displayName, '', '']);

    db.close();
}

async function removeMember(member) {
    const db = await open();

    await db.run('DELETE FROM members ' +
        'WHERE id = ?', [member.id]);

    db.close();
}

function filterRoles(member, neighbourhoodNames) {
    let filteredRoles = {};

    let memberRoles = [];

    member.roles.forEach(role => memberRoles.push(role));
    const rolesToFilter = ['@everyone', 'admin', 'bot', 'mods', 'mysticleader', 'instinctleader', 'valorleader', 'mystic', 'instinct', 'valor'];
    let memberRoleNames = [];

    rolesToFilter.forEach(roleToFilter => memberRoles = memberRoles.filter(memberRole => memberRole.name !== roleToFilter));
    memberRoles.forEach(role => memberRoleNames.push(role.name));

    filteredRoles.pokemon = memberRoleNames.filter(e => !neighbourhoodNames.includes(e)).sort();
    filteredRoles.neighbourhood = memberRoleNames.filter(e => neighbourhoodNames.includes(e)).sort();

    return filteredRoles;
}

async function getTable() {

    const db = await open();

    const sql = 'SELECT * ' +
        'FROM members';

    const table = await db.all(sql);

    await db.close();

    return table;
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

async function hasFilter(memberId, filter) {
    const db = await open();

    // Check if filter already assigned
    const filters = await getFilters(db, memberId);

    db.close();

    if (filters.pokemon.contains(filter) || filters.neighbourhood.contains(filter))
        return true;
    else
        return false;
}

function hasEveryFilter(member, filters) {
    //if (member.nickname === 'uphillsimplex') console.log(member.pokemon);
    return filters.map(filter => {
        if (member.pokemon.split(',').contains(filter) || member.neighbourhood.split(',').contains(filter))
            return true;
        else
            return false;
    }).every(e => e);
}

async function getFilteredMembers(guild, ctx) {
    //const client = ctx.client;
    const spawn = ctx.spawn;

    const db = await open();
    //console.log('Open Database!');

    const sql = 'SELECT * ' +
        'FROM members';

    const members = await db.all(sql);

    db.close();

    const conditions = [
        (member) => hasEveryFilter(member, [spawn.name, spawn.neighbourhood]),
        (member) => hasEveryFilter(member, ['unown']) && spawn.name.toLowerCase().includes('unown'),
        (member) => hasEveryFilter(member, ['iv100', spawn.neighbourhood]) && (spawn.iv ? spawn.iv.replace('%', '') >= 99 : false),
        (member) => hasEveryFilter(member, ['iv90', spawn.neighbourhood]) && (spawn.iv ? spawn.iv.replace('%', '') >= 90 : false),
        (member) => hasEveryFilter(member, ['cp2500', spawn.neighbourhood]) && (spawn.cp ? spawn.cp >= 2500 : false),
        (member) => hasEveryFilter(member, ['iv90lv30', spawn.neighbourhood]) && (spawn.iv ? spawn.iv.replace('%', '') >= 90 : false) && (spawn.level ? parseInt(spawn.level) > 29 : false),
        (member) => hasEveryFilter(member, ['iv90lv25', spawn.neighbourhood]) && (spawn.iv ? spawn.iv.replace('%', '') >= 90 : false) && (spawn.level ? parseInt(spawn.level) >= 25 : false),
        (member) => hasEveryFilter(member, ['iv95lv25', spawn.neighbourhood]) && (spawn.iv ? spawn.iv.replace('%', '') >= 95 : false) && (spawn.level ? parseInt(spawn.level) >= 25 : false)
    ];

    const dbMembers = await pluck(members, async member => any(await Promise.all(await conditions.map(async condition => await condition(member)))));

    return dbMembers.map(member => guild.members.find('id', member.id));
}

// function all(booleans) {
//     return booleans.every(e => e);
// }

function any(booleans) {
    // console.log(booleans);
    return booleans.some(e => e);
}

async function pluck(elements, predicate) {
    let plucked = [];
    for (const element of elements) {
        //console.log(element);
        // const bool = (await predicate(element)) ? '!!!!!TRUE!!!!!!' : 'false';
        // console.log(predicate.toString() + '(' + element.nickname + '): ' + bool);
        if (await predicate(element)) {

            plucked.push(element);
        }
    }
    return plucked;
}

async function addFilter(memberId, filter) {
    // const pokemonNames = getPokemons();
    const neighbourhoodNames = getNeighbourhoods();

    // Check if filter is a valid one
    //if (!pokemonNames.contains(filter) && !neighbourhoodNames.contains(filter))
    if (!isValidFilter(filter))
        throw 'addFilter: Not a valid filter option! Pas une option de filtre valide!';

    const newFilter = getEnglishName(filter);
    const db = await open();

    // Check if filter already assigned
    const filters = await getFilters(db, memberId);
    if (filters.pokemon.contains(newFilter) || filters.neighbourhood.contains(newFilter))
        return;

    // Determine if filter pokemon or neighbourhood name
    const field = neighbourhoodNames.contains(newFilter) ? 'neighbourhood' : 'pokemon';

    // Update column with filters + filter
    const newFieldValue = filters[field].join(',') + (filters[field] == '' ? '' : ',') + newFilter;
    await update(db, memberId, field, newFieldValue);

    db.close();
}

async function setFilters(memberId, field, filters) {
    const db = await open();

    await update(db, memberId, field, filters.join(','));
}

async function removeFilter(memberId, filter) {

    // Check if filter is a valid one
    if (!isValidFilter(filter))
        throw 'removeFilter: Not a valid filter option!';

    const newFilter = getEnglishName(filter);
    const db = await open();

    // Check if filter assigned
    const filters = await getFilters(db, memberId);
    if (!filters.pokemon.contains(newFilter) && !filters.neighbourhood.contains(newFilter))
        return;

    // Determine if filter pokemon or neighbourhood name
    const field = filters.neighbourhood.contains(newFilter) ? 'neighbourhood' : 'pokemon';

    // Update field with filters - filter
    const newFieldValue = filters[field].filter(values => values !== newFilter.toLowerCase()).join(',');
    await update(db, memberId, field, newFieldValue);

    db.close();
}

async function open(dbPath = MEMBER_DATABASE_PATH) {
    const db = await sqlite.open(dbPath, {
        Promise
    });
    //console.log('Opens here!');
    return db;
}

async function update(db, memberId, field, value) {
    const sql = 'UPDATE members ' +
        'SET ' + field + ' = (?) ' +
        'WHERE id = (?)';

    await db.run(sql, [value, memberId]);

    return;
}

function getPokemons(language = 'english') {
    if (language === 'french')
        return [...pkmndict_fr.pokemon_list, ...POKEMON_CONDITIONAL_FILTERS];
    else
        return [...pkmndict.pokemon_list, ...POKEMON_CONDITIONAL_FILTERS];
}

function getTranslation(pokemonName) {
    pokemonName = Diacritics.clean(pokemonName);
    const englishNames = getPokemons();
    const frenchNames = getPokemons('french');

    if (frenchNames.contains(pokemonName))
        return englishNames[frenchNames.indexOf(pokemonName.toLowerCase())];
    else if (englishNames.contains(pokemonName))
        return frenchNames[englishNames.indexOf(pokemonName.toLowerCase())];
    else
        throw 'getTranslation: Error using getTranslation. pokemonName not found in either pkmn.json dicts.';
}

function clean(name) { // Used in getEnglishName() and isValidFilter() to ensure match to names in dicts (pkmn.json and pkmn_fr.json)
    let cleanName = name;
    const mapReplace = {
        '’': '\''
    };

    for (const key in mapReplace) {
        cleanName = cleanName.replace(key, mapReplace[key]);
    }

    return Diacritics.clean(cleanName); // Replaces accented characters with regular ones
}

function getEnglishName(name) {
    name = clean(name);

    const englishPokemonNames = getPokemons();
    const frenchPokemonNames = getPokemons('french');
    const neighbourhoodNames = getNeighbourhoods();

    if (!isValidFilter(name))
        throw 'getEnglishName: Not a valid filter option! Pas une option de filtre valide!';
    else if (frenchPokemonNames.contains(name))
        return englishPokemonNames[frenchPokemonNames.indexOf(name.toLowerCase())];
    else if (englishPokemonNames.contains(name))
        return name.toLowerCase();
    else if (neighbourhoodNames.contains(name))
        return name.toLowerCase();
    else
        throw 'getEnglishName: Error using getEnglishName. pokemonName not found in either pkmn.json dicts.';
}

function isValidFilter(filter) {
    //console.log(filter);
    filter = clean(filter);
    //console.log(filter);

    const englishPokemonNames = getPokemons();
    const frenchPokemonNames = getPokemons('french');
    const neighbourhoodNames = getNeighbourhoods();

    // Check if filter is a valid one
    if (!englishPokemonNames.contains(filter) && !frenchPokemonNames.contains(filter) && !neighbourhoodNames.contains(filter))
        return false;
    else
        return true;
}

function getNeighbourhoods() {
    const polygons = getPolygons();
    let neighbourhoodNames = [];

    for (let i = 0; i < polygons.length; i++) { // i: number of neighbourhood polygons
        for (let j = 0; j < polygons[i].geometry.coordinates[0].length; j++) { // j: number of gps triples within polygon
            polygons[i].geometry.coordinates[0][j].pop(); // Take out altitute coordinate {z: 0}
            polygons[i].geometry.coordinates[0][j].reverse(); // Flip (lng,lat) into (lat,lng) pairs
        }
        neighbourhoodNames[i] = polygons[i].properties.name;
    }

    return neighbourhoodNames;
}

function getPolygons() {
    let kml;
    try {
        kml = new DOMParser().parseFromString(fs.readFileSync('neighbourhoods.kml', 'utf8'));
    } catch (e) {
        kml = new DOMParser().parseFromString(fs.readFileSync('../pikachu-bot/assets/data/neighbourhoods.kml', 'utf8'));
    }

    let polygonCollection = tj.kml(kml);
    let polygons = [];

    for (let i = 0; i < polygonCollection.features.length; i++) {
        polygons[i] = polygonCollection.features[i];
    }
    for (var i = 0; i < polygons.length; i++) { // i: number of neighbourhood polygons
        for (var j = 0; j < polygons[i].geometry.coordinates[0].length; j++) { // j: number of gps triples within polygon
            polygons[i].geometry.coordinates[0][j].pop(); // Take out altitute coordinate {z: 0}
            polygons[i].geometry.coordinates[0][j].reverse(); // Flip (lng,lat) into (lat,lng) pairs
        }
    }

    return polygons;
}

Object.prototype.contains = function (str) {
    return this.includes(str.toLowerCase());
};