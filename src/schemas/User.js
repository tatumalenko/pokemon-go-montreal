const mongoose = require('mongoose');
const _ = require('lodash');
const Utils = require('../utils/Utils');

const { Schema } = mongoose;
// const { pokemonListEnglish } = require('../../data/pokemonListEnglish.json');
// const { neighbourhoodList } = require('../../data/neighbourhoodList.json');

const UserSchema = Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    locations: [{
        type: String,
        validate: {
            validator(v) {
                return Utils.getNeighbourhoodNames().includes(v);
            },
            // This error should not occur since it's supposed to be validated in the `want` command, if so there's an error in logic
            message: Utils.createErrorMsg({
                english: 'Oops. Something went wrong when trying to set your neighbourhoods.',
                french: 'Oops. Quelque chose s\'est mal passé lors de définir vos quartiers.',
            }),
        },
    }],
    preferences: {
        wild: {
            status: {
                type: String,
                enum: ['on', 'off'],
                default: 'on',
            },
            pokemons: {
                type: [Schema.Types.Mixed],
                validate: [
                    {
                        validator: v => v.every(obj => ['name', 'neighbourhoods', 'iv', 'level'].every(key => Object.keys(obj).includes(key))),
                        message: Utils.createErrorMsg({
                            english: 'Oops. Something went wrong. Missing required query fields.',
                            french: 'Oops. Quelque chose s\'est mal passé lors. Il manque certains champs nécessaires.',
                        }),
                    },
                    {
                        validator: v => _.uniqWith(v, _.isEqual).length === v.length,
                        message: Utils.createErrorMsg({
                            english: 'Oops. You already have that alert preference!',
                            french: 'Oops. Vous avez déjà cette préférence d\'alerte!',
                        }),
                    },
                    {
                        validator: v => v.every(obj => Utils.getPokemonNames('english').includes(obj.name)),
                        message: Utils.createErrorMsg({
                            english: 'Oops. Invalid Pokemon name!',
                            french: 'Oops. Nom de Pokemon invalide!',
                        }),
                    },
                    {
                        validator: v => v.every(obj => obj.neighbourhoods.map(n => Utils.getNeighbourhoodNames().includes(n))),
                        message: Utils.createErrorMsg({
                            english: 'Oops. Neighbourhood(s) names invalid!',
                            french: 'Oops. Nom de quartier(s) invalide(s)!',
                        }),
                    },
                    {
                        validator: v => v.every(obj => obj.iv === 0 || (obj.iv > 40 && obj.iv <= 100)),
                        message: Utils.createErrorMsg({
                            english: 'Oops. Pokemon IV number is invalid!',
                            french: 'Oops. Numéro de IV pour Pokemon est invalide!',
                        }),
                    },
                    {
                        validator: v => v.every(obj => obj.level === 0 || (obj.level > 0 && obj.level <= 40)),
                        message: Utils.createErrorMsg({
                            english: 'Oops. Pokemon level is invalid!',
                            french: 'Oops. Numéro de niveau pour Pokemon est invalide!',
                        }),
                    },
                ],
            },
            blacklist: {
                type: [String],
                validate: [
                    {
                        validator: v => v.every(str => Utils.getPokemonNames('english').includes(str)),
                        message: Utils.createErrorMsg({
                            english: 'Oops. Invalid Pokemon name!',
                            french: 'Oops. Nom de Pokemon invalide!',
                        }),
                    },
                ],
            },
        },
    },
});

module.exports = mongoose.model('User', UserSchema, 'users');

