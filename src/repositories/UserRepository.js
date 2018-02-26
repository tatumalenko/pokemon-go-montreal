const mongoose = require('mongoose');
const User = require('../schemas/User');
const WildSpawn = require('../models/WildSpawn');
const RaidSpawn = require('../models/RaidSpawn');

class UserRepository {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
        this.init();
    }

    async init() {
        try {
            mongoose.connect(this.dbPath, { useMongoClient: true });
            mongoose.Promise = global.Promise;
            this.db = mongoose.connection;
            this.db.on('error', console.error.bind(console, 'MongoDB connection error:'));
        } catch (err) {
            console.log(err);
        }
    }

    close() {
        if (this.client) { this.client.close(); }
    }

    // eslint-disable-next-line class-methods-use-this
    async addUser(discordUser) {
        await User.update({
            id: discordUser.id,
        }, {
            id: discordUser.id,
            name: discordUser.username ? discordUser.username : discordUser.displayName,
        }, { upsert: true });
    }

    // eslint-disable-next-line class-methods-use-this
    async removeUser(discordUser) {
        await User.remove({ id: discordUser.id });
    }

    // fetchAllUsers() {
    //     return User.find({});
    // }

    // eslint-disable-next-line class-methods-use-this
    async fetchUser(discordUser) {
        let user = await User
            .where('id', discordUser.id)
            .findOne();

        if (!user) {
            user = new User({
                id: discordUser.id,
                name: discordUser.username,
            });
        }

        await user.save();
        return user;
    }

    // eslint-disable-next-line class-methods-use-this
    async pullFromUser(discordUser, filter) {
        const response = await User.update({
            id: discordUser.id,
        }, {
            $pull: filter,
        });
        return response;
    }

    // eslint-disable-next-line class-methods-use-this
    async pushToUser(discordUser, filter) {
        const response = await User.update({
            id: discordUser.id,
        }, {
            $push: filter,
        });
        return response;
    }

    // eslint-disable-next-line class-methods-use-this
    async findUsers(spawn) {
        let queryUser;
        let matchedUsers;
        try {
            // Its more of a wild spawn
            if (spawn instanceof WildSpawn) {
                queryUser = {
                    'preferences.wild.pokemons': {
                        $elemMatch: {
                            name: {
                                $in: [spawn.name.toLowerCase(), 'all'],
                            },
                            iv: {
                                $lte: spawn.iv && spawn.iv !== 'NA' ? spawn.iv : 0,
                            },
                            level: {
                                $lte: spawn.level && spawn.iv !== 'NA' ? spawn.level : 0,
                            },
                            neighbourhoods: {
                                $in: [spawn.location.neighbourhood.toLowerCase(), 'everywhere'],
                            },
                        },
                    },
                    'preferences.wild.status': 'on',
                    'preferences.wild.blacklist': { $nin: [spawn.name.toLowerCase()] },
                };
            } else if (spawn instanceof RaidSpawn) {
                queryUser = {
                    'preferences.raid.pokemons': {
                        $elemMatch: {
                            status: 'on',
                            name: {
                                $in: [spawn.name, 'all'],
                            },
                            tier: {
                                $lte: spawn.tier ? spawn.tier : 0,
                            },
                            neighbourhoods: {
                                $in: [spawn.location.neighbourhood, 'all'],
                            },
                        },
                    },
                };
            }
            // console.log(queryUser['preferences.wild.pokemons'].$elemMatch.name);
            // console.log(queryUser['preferences.wild.pokemons'].$elemMatch.iv);
            // console.log(queryUser['preferences.wild.pokemons'].$elemMatch.level);
            // console.log(queryUser['preferences.wild.pokemons'].$elemMatch.neighbourhoods);
            matchedUsers = await User.find(queryUser);
        } catch (err) {
            console.log(err);
        }
        return matchedUsers;
    }
}

module.exports = UserRepository;

// (async () => {
//     const ur = new UserRepository({
//         collectionName: 'users',
//         dbName: 'pikachu',
//         dbPath: 'mongodb://localhost:27017/pikachu',
//     });
//     console.log(await ur.findUsers({}));
// })();
