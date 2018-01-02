const MongoClient = require('mongodb').MongoClient;

const du = require('./dbutils4');

class MongoUtils {
    constructor(
        urlPath = 'mongodb://localhost:27017/pikachu',
        dbName = 'pikachu',
        collectionName = 'members'
    ) {
        this.urlPath = urlPath; // Connection URL
        this.dbName = dbName; // Database Name
        this.collectionName = collectionName; // Collection Name
        this.open();
    }

    async convert() {
        try {
            const sqldb = await du.getTable();
            let docArray = [];

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

            await this.db.remove({});
            await this.db.insert(docArray);
        } catch (err) {
            console.log(err.stack);
        }
    }

    async open() {
        try {
            this.client = await MongoClient.connect(this.urlPath);
            this.db = await this.client.db(this.dbName).collection(this.collectionName);
        } catch (err) {
            console.log(err.stack);
        }
    }

    close() {
        if (this.client)
            this.client.close();
    }

    async getFilters(memberId) {
        try {
            const dbMember = await this.db.find({
                'id': memberId
            }).toArray();

            if (dbMember.length > 1)
                console.log('\nCAREFUL: mongoutils3.getFilters found two collection objects with same id field! Using first one found.\n');

            return dbMember[0].filters;
        } catch (err) {
            console.log(err.stack);
        }
    }

    async hasFilter({
        memberId,
        filter
    }) {
        try {
            const memberFilters = await this.getFilters(memberId);

            for (const memberFilter of memberFilters) {
                if (this.filterEquals(filter, memberFilter))
                    return true;

            }

            for (const memberFilter of memberFilters) {
                if (this.filterEquals(filter, memberFilter, ['pokemon', 'iv', 'level']))
                    return true;
            }

            return false;
        } catch (err) {
            console.log(err.stack);
        }
    }

    async getFilteredMemberIds(filter) {
        try {
            let query;

            if (filter.neighbourhood)
                query = {
                    'filters': {
                        $elemMatch: {
                            pokemon: {
                                $in: [filter.name, 'all']
                            },
                            neighbourhood: {
                                $in: [filter.neighbourhood, 'all']
                            },
                            iv: {
                                $lte: filter.iv ? filter.iv : 0
                            },
                            level: {
                                $lte: filter.level ? filter.level : 0
                            }
                        }
                    }
                };
            else
                query = {
                    'filters': {
                        $elemMatch: {
                            pokemon: {
                                $in: [filter.pokemon, 'all']
                            },
                            iv: {
                                $lte: filter.iv ? filter.iv : 0
                            },
                            level: {
                                $lte: filter.level ? filter.level : 0
                            }
                        }
                    }
                };

            const result = await this.db.find(query).toArray();
            return result.map(e => e.id);
        } catch (err) {
            console.log(err.stack);
        }
    }

    async addFilter({
        memberId,
        filter
    }) {
        try {
            await this.db.update({
                id: memberId
            }, {
                $push: {
                    filters: filter
                }
            })
        } catch (err) {
            console.log(err.stack);
        }
    }

    async removeFilter({
        memberId,
        filter
    }) {
        try {
            await this.db.update({
                id: memberId
            }, {
                $pull: {
                    filters: filter
                }
            })
        } catch (err) {
            console.log(err.stack);
        }
    }

    async setFilters({
        memberId,
        what,
        whatNames
    }) {

    }

    filterEquals(filter1, filter2, fields = ['pokemon', 'neighbourhood', 'iv', 'level']) {
        // Deep compare each object field using fields elements as keys to compare within
        if (!fields.every((e) => {
                if (Array.isArray(filter1[e]) && Array.isArray(filter2[e])) {

                    // If object field is array, sort and ensure all array elements equal
                    return filter1[e].sort().every((e2, i) => {
                        return e2 === filter2[e].sort()[i];
                    });
                }

                return filter1[e] === filter2[e];
            }))
            return false;

        return true;
    }

    /**---------------------------------------------------------------------------------------------
     * PIKACHU CALLS THESE FUNCTIONS
     *--------------------------------------------------------------------------------------------*/
    async addMember(member) {
        try {
            await this.db.insert({
                id: member.id,
                username: member.nickname,
                filters: []
            });
        } catch (err) {
            console.log(err.stack);
        }
    }

    async removeMember(member) {
        try {
            await this.db.remove({
                id: member.id
            });
        } catch (err) {
            console.log(err.stack);
        }
    }

    async getFiltersStr(member) {
        const memberId = member.id;

        try {
            const filters = await this.getFilters(memberId);

            const strArr = ['POKEMON | NEIGHBOURHOOD | LV | IV'];

            for (const filter of filters) {
                strArr.push(
                    filter.pokemon + ' | ' + (typeof filter.neighbourhood === 'object' ? filter.neighbourhood.join(', ') : filter.neighbourhood) + ' | ' + filter.level + ' | ' + filter.iv
                );
            }

            return strArr.join('\n');
        } catch (err) {
            console.log(err.stack);
        }
    }

    createQueryFilterFromMessage(strArgs) {
        const pokemonNames = []; // Can be length of 1+
        const neighbourhoodNames = []; // Can be length of 1+
        const levels = []; // Should only be length of 1
        const ivs = []; // Should only be length of 1

        // Clean args string (replace commas with space and replace multiple spaces with one space)
        const strCleanArgs = strArgs.replace(/,/g, ' ').replace(/\s+/g, ' ');
        // Extract words from string and convert to lowercase
        const words = strCleanArgs.split(' ').map(w => w.toLowerCase());
        // Extract numbers from string
        const numbers = strCleanArgs.match(/\d+/g);

        // Loop through words and extract pokemonNames and neighbourhoodNames
        for (const word of words) {
            if (dictutils.isValidFilter(word)) {
                if (dictutils.getFilterType(word) === 'pokemon')
                    pokemonNames.push(word);
                else if (dictutils.getFilterType(word) === 'neighbourhood')
                    neighbourhoodNames.push(word);
                //else // word is neither pokemonName or neighbourhoodName
            }
        }

        // Loop through numbers and extract levels and ivs based on magnitudes
        for (const number of numbers) {
            if (number >= 41)
                ivs.push(number);
            else if (number >= 0 && number <= 40)
                levels.push(number);
            else
                throw 'Invalid number entered, must be between 0 and 100. Le nombre entré est invalide, doit être compris entre 0 et 100.';
        }

        if (ivs.length > 1)
            throw 'Invalid number entered, only enter 1 number between 41 and 100. Nombre invalide entré, entrez seulement 1 nombre entre 41 et 100.';
        if (levels.length > 1)
            throw 'Invalid number entered, only enter 1 number between 0 and 40. Nombre invalide entré, entrez seulement 1 nombre compris entre 0 et 40.';


    }
}

module.exports = {
    MongoUtils
};

// (async function () {
//     try {
//         const member = {
//             id: '368363854284980224'
//         };
//         const memberId = member.id;

//         const db = new MongoUtils();
//         await db.open();

//         //console.log(await db.getFilters(member.id));

//         // console.log(await db.getFiltersStr(member));

//         // console.log(await db.hasFilter({
//         //     memberId,
//         //     filter: {
//         //         pokemon: 'geodude',
//         //         neighbourhood: ['ville-marie'],
//         //         level: 20,
//         //         iv: 0
//         //     }
//         // }));

//         // console.log(await db.hasFilter({
//         //     memberId,
//         //     filter: {
//         //         pokemon: 'geodude',
//         //         level: 20,
//         //         iv: 0
//         //     }
//         // }));

//         // console.log(await db.hasFilter({
//         //     memberId,
//         //     filter: {
//         //         "pokemon": "dragonite",
//         //         "neighbourhood": [
//         //             "pierrefonds-roxboro",
//         //             "dollard-des-ormeaux",
//         //             "ville-marie"
//         //         ],
//         //         "iv": 0,
//         //         "level": 0,
//         //         "cp": 0
//         //     }
//         // }));

//         console.log(await db.getFilteredMemberIds({
//             filter: {
//                 pokemon: 'blissey',
//                 neighbourhood: 'ville-marie',
//                 level: 20,
//                 iv: 70
//             }
//         }));

//         // await db.addFilter({
//         //     memberId,
//         //     filter: {
//         //         pokemon: 'geodude',
//         //         neighbourhood: ['ville-marie'],
//         //         level: 20,
//         //         iv: 0
//         //     }
//         // });

//         // console.log(await db.getFiltersStr({
//         //     id: '303026790543392771'
//         // }));

//         // await db.removeFilter({
//         //     memberId,
//         //     filter: {
//         //         pokemon: 'geodude'
//         //     }
//         // });

//         // console.log(await db.getFiltersStr(member));

//         //await db.convert();

//         db.close();
//     } catch (err) {
//         console.log(err.stack);
//     }
// })();