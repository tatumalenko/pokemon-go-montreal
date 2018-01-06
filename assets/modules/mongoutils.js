const MongoClient = require('mongodb').MongoClient;
const DictU = require('./dictutils');
const dictutils = new DictU.DictUtils();
const dbsql = require('./sqlutils');

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
            const sqldb = await dbsql.getTable();
            let docArray = [];

            for (const member of sqldb) {
                let filters = [];

                for (const filter of member.pokemon.split(',')) {
                    let tempFilter;
                    const curNeigh = member.neighbourhood.split(',') == '' ? [] : member.neighbourhood.split(',');

                    switch (filter) {
                        case 'iv90':
                            tempFilter = {
                                pokemon: 'all',
                                neighbourhood: curNeigh,
                                iv: 90,
                                level: 0
                            };
                            break;
                        case 'iv95':
                            tempFilter = {
                                pokemon: 'all',
                                neighbourhood: curNeigh,
                                iv: 95,
                                level: 0
                            };
                            break;
                        case 'iv97':
                            tempFilter = {
                                pokemon: 'all',
                                neighbourhood: curNeigh,
                                iv: 97,
                                level: 0
                            };
                            break;
                        case 'iv100':
                            tempFilter = {
                                pokemon: 'all',
                                neighbourhood: curNeigh,
                                iv: 100,
                                level: 0
                            };
                            break;
                        case 'iv90lv30':
                            tempFilter = {
                                pokemon: 'all',
                                neighbourhood: curNeigh,
                                iv: 90,
                                level: 30
                            };
                            break;
                        case 'iv90lv25':
                            tempFilter = {
                                pokemon: 'all',
                                neighbourhood: curNeigh,
                                iv: 90,
                                level: 25
                            };
                            break;
                        case 'iv95lv25':
                            tempFilter = {
                                pokemon: 'all',
                                neighbourhood: curNeigh,
                                iv: 95,
                                level: 25
                            };
                            break;
                        case 'cp2500':
                            tempFilter = {
                                pokemon: 'all',
                                neighbourhood: curNeigh,
                                iv: 0,
                                level: 30
                            };
                            break;
                        case 'unown':
                            tempFilter = {
                                pokemon: 'unown',
                                neighbourhood: ['everywhere'],
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
                    status: 'on',
                    defaultNeighbourhood: [],
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
            }).toArray(); // Array of member objects is returned

            if (dbMember.length > 1)
                console.log('\nCAREFUL: mongoutils.getFilters found two collection objects with same id field! Using first one found.\n');

            return dbMember[0].filters; // Hopefully the first is the only one
        } catch (err) {
            console.log(err.stack);
        }
    }

    async addFilter({
        memberId, // String
        filter // Object
    }) {
        const hasFilter = await this.hasFilter({
            memberId,
            filter
        });

        if (hasFilter) {
            throw ':flag_gb: You already have this filter or attempted to add two or more of the same. \n:flag_fr: Vous avez déjà ce filtre ou vous avez essayez d\'ajouter deux ou plus identiques.';
            return;
        }

        try {
            await this.db.update({
                id: memberId
            }, {
                $push: {
                    filters: filter
                }
            });
        } catch (err) {
            console.log(err);
        }
    }

    async hasFilter({
        memberId, // String
        filter // Object
    }) {
        try {
            const memberFilters = await this.getFilters(memberId);
            for (const memberFilter of memberFilters) {
                if (this.filterEquals(filter, memberFilter))
                    return true;
            }
            // A less 'deep' copy equality check - only checks pokemon, iv, and level fields (omits neighbourhood equality checks)
            // for (const memberFilter of memberFilters) {
            //     if (this.filterEquals(filter, memberFilter, ['pokemon', 'iv', 'level']))
            //         return true;
            // }

            return false;
        } catch (err) {
            console.log(err);
        }
    }

    async removeFilter({
        memberId, // String
        filter // Object
    }) {
        try {
            await this.db.update({
                id: memberId
            }, {
                $pull: {
                    filters: filter
                }
            });
        } catch (err) {
            console.log(err.stack);
        }
    }

    async clearFilters(memberId) {
        try {
            await this.db.update({
                id: memberId
            }, {
                $set: {
                    filters: []
                }
            });
        } catch (err) {
            console.log(err.stack);
        }
    }

    async getFilteredMemberIdsArray(filter) {
        try {
            let query;

            if (filter.neighbourhood)
                query = {
                    'status': 'on',
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
            else // Not really useful right now honestly
                query = {
                    'status': 'on',
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

    async getStatus(memberId) {
        if (!memberId) return;

        const members = await this.db.find({
            id: memberId
        }).toArray();

        return members[0].status;
    }

    async setStatus({
        memberId, // String
        arg // String
    }) {
        if (!memberId) return;

        let status;

        switch (arg.toLowerCase()) {
            case 'on':
                status = 'on';
                break;
            case 'off':
                status = 'off';
                break;
            default:
                throw 'Not a valid status option. Pas une option valide pour l\'état. \'on\' or/ou \'off\'';
                break;
        }

        if (!status) return;

        await this.db.update({
            id: memberId
        }, {
            $set: {
                status: status
            }
        });
    }

    // I wrote it as neighbourhood in singular (even if it's an array) because that's
    // how it appears in the database and throughout... Kind of bugs me though...
    async getDefaultNeighbourhood(memberId) {
        if (!memberId) return;

        const members = await this.db.find({
            id: memberId
        }).toArray();

        return members[0].defaultNeighbourhood.sort();
    }

    async setDefaultNeighbourhood({
        memberId, // String
        args // String (everything proceeding 'want'/'unwant' cmd)
    }) {
        if (!memberId) return;

        // Use createQueryFilterArrayFromMessage method's validation logic and 
        // use it later to extract neighbourhoods user entered
        const queryFilter = await this.createQueryFilterArrayFromMessage({
            cmd: 'want',
            args
        });

        const defaultNeighbourhood = queryFilter[0].neighbourhood; // Only one should be returned since no pokemon where specified

        if (!defaultNeighbourhood) return;

        await this.db.update({
            id: memberId
        }, {
            $set: {
                defaultNeighbourhood: defaultNeighbourhood.sort()
            }
        });
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

    async addMember(member) {
        try {
            await this.db.insert({
                id: member.id,
                status: 'on',
                defaultNeighbourhood: [],
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

    async createFiltersString(member) {
        const memberId = member.id;

        try {
            const filters = await this.getFilters(memberId);
            let defaultNeighbourhood = await this.getDefaultNeighbourhood(memberId);
            defaultNeighbourhood = defaultNeighbourhood ? defaultNeighbourhood.join(', ') : 'none/aucun';

            const strArr = ['**User/Utilisateur:** ' + member.displayName + '\n**Status:** ' + await this.getStatus(memberId) + '\n**Default Locations Défaults:** ' + defaultNeighbourhood + '\n**POKEMON | NEIGHBOURHOOD | LV | IV**'];

            for (const filter of filters) {
                strArr.push(
                    '`' + filter.pokemon + ' | ' + (typeof filter.neighbourhood === 'object' ? filter.neighbourhood.sort().join(', ') : filter.neighbourhood) + ' | ' + filter.level + ' | ' + filter.iv + '`'
                );
            }
            return strArr.sort().join('\n');
        } catch (err) {
            console.log(err.stack);
        }
    }

    async createQueryFilterArrayFromMessage({
        memberId, // String
        cmd, // String
        args // String
    }) {
        const pokemonNames = []; // Can be length of 0+
        let neighbourhoodNames = []; // Can be length of 0+
        const levels = []; // Should only be length of 1
        const ivs = []; // Should only be length of 1

        // Clean args string (replace commas with space and replace multiple spaces with one space)
        const cleanArgs = args.replace(/,/g, ' ').replace(/\s+/g, ' ');
        // Extract words from string and convert to lowercase and take out iv/lv keywords out
        const words = cleanArgs.replace(/\d+/g, '').replace(/\s+/g, ' ').trim().split(' ').map(w => w.toLowerCase()).filter(word => !['iv', 'niveau', 'lv', 'level', 'lvl'].includes(word.replace(/\d+/, '')));
        // Extract numbers from string and reverse method ensures non-zero are placed into iv/level arrays first
        const numbers = cleanArgs.match(/\d+/g) ? cleanArgs.match(/\d+/g).reverse() : cleanArgs.match(/\d+/g);

        const defaultNeighbourhood = await this.getDefaultNeighbourhood(memberId);

        // Loop through words and extract pokemonNames and neighbourhoodNames
        for (const word of words) {
            if (dictutils.isValidFilter(word)) {
                if (dictutils.getFilterType(word) === 'pokemon')
                    pokemonNames.push(dictutils.getEnglishName(word));
                else if (dictutils.getFilterType(word) === 'neighbourhood')
                    neighbourhoodNames.push(dictutils.getEnglishName(word).replace('partout', 'everywhere'));
                else // Word is neither pokemonName or neighbourhoodName
                    throw ':flag_gb: Invalid entry. Enter \'!neighbourhoods\' to see possible options.\n:flag_fr: Entré invalide. Entrez \'!quartiers\' pour voir options possibles.';
            } else
                throw ':flag_gb: Invalid entry. Enter \'!neighbourhoods\' to see possible options.\n:flag_fr: Entré invalide. Entrez \'!quartiers\' pour voir options possibles.';
        }

        // Loop through numbers and extract levels and ivs based on magnitudes
        if (numbers)
            for (const number of numbers) {
                if (number >= 41 && number <= 100)
                    ivs.push(number);
                else if (number == 0 && levels.length > 0) // Ensures if two 0s are entered, the second goes into the ivs array
                    ivs.push(number);
                else if (number >= 0 && number <= 40)
                    levels.push(number);
                else
                    throw 'Invalid number entered, must be between 0 and 100. Le nombre entré est invalide, doit être compris entre 0 et 100.';
            }

        // Validate pokemonNames.length > 1 else assume 'all', 
        // neighbourhoodNames.length > 1 else assume 'everywhere', 
        // ivs.length = levels.length = 1
        if (pokemonNames.length < 1 && (cmd === 'want' || cmd === 'veux'))
            pokemonNames.push('all');
        if (neighbourhoodNames.length < 1 && (cmd === 'want' || cmd === 'veux'))
            if (defaultNeighbourhood && defaultNeighbourhood.length > 0)
                neighbourhoodNames = defaultNeighbourhood;
            else
                neighbourhoodNames = ['everywhere'];
        if (ivs.length > 1)
            throw ':flag_gb: Invalid number entered, only enter 1 number between 41 and 100.\n:flag_fr: Nombre invalide entré, entrez seulement 1 nombre entre 41 et 100.';
        if (levels.length > 1)
            throw ':flag_gb: Invalid number entered, only enter 1 number between 0 and 40.\n:flag_fr: Nombre invalide entré, entrez seulement 1 nombre compris entre 0 et 40.';

        const filters = [];

        if (cmd === 'want' || cmd === 'veux')
            for (const pokemonName of pokemonNames) {
                filters.push({
                    pokemon: pokemonName,
                    neighbourhood: neighbourhoodNames.sort(),
                    iv: ivs[0] ? parseInt(ivs[0]) : 0,
                    level: levels[0] ? parseInt(levels[0]) : 0
                });
            }
        else if (cmd === 'unwant' || cmd === 'veuxpas') {
            if (pokemonNames.length > 0)
                for (const pokemonName of pokemonNames) {
                    const tempFilter = {};
                    tempFilter.pokemon = pokemonName;
                    if (neighbourhoodNames.length > 0) {
                        // Use defaultNeighbourhood if location/locations is used to unwant
                        if (neighbourhoodNames.includes('location') || neighbourhoodNames.includes('locations'))
                            tempFilter.neighbourhood = await this.getDefaultNeighbourhood(memberId);
                        else
                            tempFilter.neighbourhood = neighbourhoodNames.sort();
                    }

                    if (ivs.length > 0)
                        tempFilter.iv = parseInt(ivs[0]);

                    if (levels.length > 0)
                        tempFilter.level = parseInt(levels[0]);

                    filters.push(tempFilter);
                }
            else { // pokemonNames.length === 0
                const tempFilter = {};

                if (neighbourhoodNames.length > 0) {
                    // Use defaultNeighbourhood if location/locations is used to unwant
                    if (neighbourhoodNames.includes('location') || neighbourhoodNames.includes('locations'))
                        tempFilter.neighbourhood = await this.getDefaultNeighbourhood(memberId);
                    else
                        tempFilter.neighbourhood = neighbourhoodNames.sort();
                }

                if (ivs.length > 0)
                    tempFilter.iv = parseInt(ivs[0]);

                if (levels.length > 0)
                    tempFilter.level = parseInt(levels[0]);

                filters.push(tempFilter);
            }
        }
        console.log(filters);
        return filters;
    }
}

module.exports = {
    MongoUtils
};

// Some test code, ignore...
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

//         // console.log(await db.getFilteredMemberIdsArray({
//         //     filter: {
//         //         pokemon: 'blissey',
//         //         neighbourhood: 'ville-marie',
//         //         level: 20,
//         //         iv: 70
//         //     }
//         // }));

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

//         // const filters = db.createQueryFilterArrayFromMessage({
//         //     cmd: 'unwant',
//         //     args: 'plateau, ahuntsic, iv90'
//         // });

//         // console.log(filters);

//         // const filters = [{
//         //     neighbourhood: 'plateau'
//         // }]

//         // for (const filter of filters) {
//         //     // await db.addFilter({
//         //     //     memberId: '210950208421494797',
//         //     //     filter: filter
//         //     // });

//         //     await db.removeFilter({
//         //         memberId: '210950208421494797',
//         //         filter: filter
//         //     });
//         // }

//         // const hasFilter = await db.hasFilter({
//         //     memberId: '210950208421494797',
//         //     filter: filter
//         // });

//         // console.log();


//         //await db.convert();

//         // console.log(await db.getDefaultNeighbourhood('210950208421494797'));

//         await db.setDefaultNeighbourhood({
//             memberId: '210950208421494797',
//             args: 'plateau, ville-marie'
//         });

//         console.log(await db.getFiltersStr({
//             id: '210950208421494797',
//             displayName: 'uphillsimplex'
//         }));


//         db.close();
//         process.exit(0);
//     } catch (err) {
//         console.log(err);
//         process.exit(0);
//     }
// })();