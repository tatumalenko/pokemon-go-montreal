// Import the pkmn.json static database file
const pkmndict = require('../data/pkmn.json');
const pkmndict_fr = require('../data/pkmn_fr.json');

const neighbourhood_dict = require('../data/neighbourhood_synonyms.json').neighbourhood_dict;

const Diacritics = require('diacritic');

class DictUtils {
    constructor() {

    }

    isValidFilter(filter) {
        //console.log(filter);
        filter = this.clean(filter);
        //console.log(filter);

        const englishPokemonNames = this.getPokemonNamesArray();
        const frenchPokemonNames = this.getPokemonNamesArray('french').map(e => this.clean(e));
        const neighbourhoodNames = this.getNeighbourhoodNamesArray();

        // Check if filter is a valid one
        if (!englishPokemonNames.contains(filter) && !frenchPokemonNames.contains(filter) && !neighbourhoodNames.contains(filter))
            return false;
        else
            return true;
    }

    clean(name) {
        let cleanName = name;
        const mapReplace = {
            '’': '\'' // When users use apostrophes
        };

        for (const key in mapReplace) {
            cleanName = cleanName.replace(key, mapReplace[key]);
        }

        return Diacritics.clean(cleanName); // Replaces accented characters with regular ones
    }

    getNeighbourhoodSynonym(filter) {
        for (let neighbourhood of neighbourhood_dict) {
            if (neighbourhood.contains(filter))
                return neighbourhood[0]; // The first element represents the used name in map
        }
        return filter;
    }

    getPokemonNamesArray(language = 'english') {
        if (language === 'french')
            return [...pkmndict_fr.pokemon_list];
        else
            return [...pkmndict.pokemon_list];
    }

    getNeighbourhoodNamesArray() {
        let neighbourhoodNames = [];
        for (let neighbourhood of neighbourhood_dict) {
            neighbourhoodNames.push(neighbourhood[0]);
        }
        return neighbourhoodNames;
    }

    getTranslation(pokemonName) {
        pokemonName = Diacritics.clean(pokemonName);
        const englishNames = this.getPokemonNamesArray();
        const frenchNames = this.getPokemonNamesArray('french');

        if (frenchNames.map(e => this.clean(e)).contains(pokemonName))
            return englishNames[frenchNames.map(e => this.clean(e)).indexOf(pokemonName.toLowerCase())];
        else if (englishNames.contains(pokemonName))
            return frenchNames[englishNames.indexOf(pokemonName.toLowerCase())];
        else
            throw 'getTranslation: Error using getTranslation. pokemonName not found in either pkmn.json dicts.';
    }

    getEnglishName(name) {
        name = this.clean(name);

        const englishPokemonNames = this.getPokemonNamesArray();
        const frenchPokemonNames = this.getPokemonNamesArray('french').map(e => this.clean(e));
        const neighbourhoodNames = this.getNeighbourhoodNamesArray();

        if (!this.isValidFilter(name))
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
}

Array.prototype.contains = function (str) {
    return this.map(s => s.toLowerCase()).includes(str.toLowerCase());
};

module.exports = {
    DictUtils
};

// (async function () {
//     const dictutils = new DictUtils();
//     console.log(dictutils.getNeighbourhoodNamesArray());
//     console.log(dictutils.getNeighbourhoodSynonym('village')); // village
//     console.log(dictutils.getNeighbourhoodSynonym('oldmtl')); // vieux-montreal
//     console.log(dictutils.getNeighbourhoodSynonym('pikachu')); // pikachu
//     console.log(dictutils.getEnglishName('poussifeu')); // torchic
//     console.log(dictutils.getEnglishName('village')); // village
//     console.log(dictutils.getEnglishName('vieux-montreal')); // vieux-montreal
//     console.log(dictutils.isValidFilter('poussifeu')); // true
//     console.log(dictutils.isValidFilter('pikachu')); // true
//     console.log(dictutils.isValidFilter('ottawa')); // false
//     console.log(dictutils.isValidFilter('pika')); // false
// })();