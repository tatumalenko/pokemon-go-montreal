const { pokemonListEnglish } = require('../../data/pokemonListEnglish.json');
const { pokemonListFrench } = require('../../data/pokemonListFrench.json');
const { neighbourhoodList } = require('../../data/neighbourhoodList.json');
const raidChannelList = require('../../data/raidChannelList.json');
const Diacritics = require('diacritic');

class Utils {
    constructor() {
        throw new Error('This is a static class, it should not be instantiated!');
    }

    static isValidFilter(filter) {
        // console.log(filter);
        filter = this.getNeighbourhoodAlias(this.clean(filter));
        // console.log(filter);

        const englishPokemonNames = this.getPokemonNames();
        const frenchPokemonNames = this.getPokemonNames('french').map(e => this.clean(e));
        const neighbourhoodNames = this.getNeighbourhoodNames();
        let validFilter;

        // Check if filter is a valid one
        if (!englishPokemonNames.includes(filter)
          && !frenchPokemonNames.includes(filter)
          && !neighbourhoodNames.includes(filter)) {
            validFilter = false;
        } else validFilter = true;

        return validFilter;
    }

    static getFilterType(word) {
        const englishPokemonNames = this.getPokemonNames();
        const neighbourhoodNames = this.getNeighbourhoodNames();
        let filterType = '';

        if (this.isValidFilter(word)) {
            if (englishPokemonNames.includes(this.getEnglishName(word))) {
                filterType = 'pokemon';
            } else if (neighbourhoodNames.includes(this.getEnglishName(word))) {
                filterType = 'neighbourhood';
            }
        } else filterType = '';

        return filterType;
    }

    static clean(name) {
        const mapReplace = {
            '’': '\'', // When users use apostrophes
        };

        let cleanName;
        Object.keys(mapReplace).forEach((key) => {
            cleanName = name.replace(key, mapReplace[key]);
        });

        return Diacritics.clean(cleanName); // Replaces accented characters with regular ones
    }

    static removeSpacesCommasFromString(str) {
        return str.replace(/,/g, ' ').replace(/\s{2,}/g, ' ');
    }

    static getNeighbourhoodsFromRaidChannel(raidChannel) {
        if (raidChannelList[raidChannel] !== undefined && raidChannelList[raidChannel].length > 0) {
            return raidChannelList[raidChannel];
        }

        return [raidChannel];
    }

    static getNeighbourhoodAlias(filter) {
        // The first element of each inner array of 2D list represents the default name
        const match = neighbourhoodList.find(aliases => aliases.includes(filter));
        return match ? match[0] : filter;
    }

    static getPokemonNames(language = 'english') {
        const pokemonNames = [];

        if (language === 'french') {
            pokemonNames.push(...pokemonListFrench.map(e => this.clean(e)), 'tous');
        } else pokemonNames.push(...pokemonListEnglish.map(e => this.clean(e)), 'all');

        return pokemonNames;
    }

    static getNeighbourhoodNames() {
        const neighbourhoodNames = neighbourhoodList.map(name => name[0]);
        return [...neighbourhoodNames.sort(), 'everywhere', 'partout', 'location', 'locations'];
    }

    static getTranslation(pokemonName) {
        pokemonName = this.clean(pokemonName);
        const englishNames = this.getPokemonNames();
        const frenchNames = this.getPokemonNames('french');
        let translation;

        if (frenchNames.includes(pokemonName)) {
            translation = englishNames[frenchNames.indexOf(pokemonName.toLowerCase())];
        } else if (englishNames.includes(pokemonName)) {
            translation = frenchNames[englishNames.indexOf(pokemonName.toLowerCase())];
        } else throw new Error('Error in `Utils.getTranslation(pokemonName)`: `pokemonName` not found in either pkmn.json dicts.');

        return translation;
    }

    static getEnglishName(name) {
        name = this.getNeighbourhoodAlias(this.clean(name));

        const englishPokemonNames = this.getPokemonNames();
        const frenchPokemonNames = this.getPokemonNames('french').map(e => this.clean(e));
        const neighbourhoodNames = this.getNeighbourhoodNames();

        if (!this.isValidFilter(name)) {
            console.log(name);
            throw new Error('Error in `Utils.getEnglishName(name)`: `name` not a valid filter option.');
        } else if (frenchPokemonNames.includes(name)) {
            return englishPokemonNames[frenchPokemonNames.indexOf(name.toLowerCase())];
        } else if (englishPokemonNames.includes(name)) {
            return name.toLowerCase();
        } else if (neighbourhoodNames.includes(name)) {
            return name.toLowerCase();
        } else {
            throw new Error('Error in `Utils.getEnglishName(name)`: `name` not found in either Pokemon or neighbourhood dicts.');
        }
    }

    static createErrorMsg({ english, french }) {
        return `:flag_gb: ${english}\n:flag_fr: ${french}`;
    }

    static parseMessageForCommand(msg) {
        const prefix = msg.content.charAt(0);
        const cmd = msg.content.slice(1).split(' ')[0].toLowerCase();
        const args = this.removeSpacesCommasFromString(msg.content.slice(1)).split(' ').slice(1).map(e => e.toLowerCase());

        return { prefix, cmd, args };
    }

    static parseWildPreferenceQueryFromArgs(args) {
        const pokemonNames = []; // Can be length of 0+
        const neighbourhoodNames = []; // Can be length of 0+
        const levels = []; // Should only be length of 1
        const ivs = []; // Should only be length of 1

        // Clean args string (replace commas with space and replace multiple spaces with one space)
        // const cleanArgs = args.replace(/,/g, ' ').replace(/\s+/g, ' ');
        const cleanArgs = this.removeSpacesCommasFromString(args);

        // Extract words from string and convert to lowercase and take out iv/lv keywords out
        const words = cleanArgs.replace(/\d+/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .map(w => w.toLowerCase())
            .filter(word => !['iv', 'niveau', 'lv', 'level', 'lvl'].includes(word.replace(/\d+/, '')));

        // console.log(cleanArgs);
        // Extract numbers from string and reverse method ensures non-zero are placed into iv/level arrays first
        const numbers = cleanArgs.match(/\d+/g)
            ? cleanArgs.match(/\d+/g).map(e => parseInt(e, 10)).reverse()
            : null;

        // Loop through words and extract pokemonNames and neighbourhoodNames
        words.forEach((word) => {
            if (Utils.isValidFilter(word)) {
                if (Utils.getFilterType(word) === 'pokemon') {
                    pokemonNames.push(Utils.getEnglishName(word));
                } else if (Utils.getFilterType(word) === 'neighbourhood') {
                    neighbourhoodNames.push(Utils.getEnglishName(word).replace('partout', 'everywhere'));
                } else { // Word is neither pokemonName or neighbourhoodName
                    console.log('The code should not have arrived here unless something is wrong in Utils.isValidFilter or Utils.getFilterType');
                    throw new Error(this.createErrorMsg({
                        english: 'Invalid entry. Enter \'!neighbourhoods\' to see possible options.',
                        french: 'Entré invalide. Entrez \'!quartiers\' pour voir options possibles.',
                    }));
                }
            } else { // Word is neither pokemonName or neighbourhoodName
                throw new Error(this.createErrorMsg({
                    english: 'Invalid entry. Enter \'!neighbourhoods\' to see possible options.',
                    french: 'Entré invalide. Entrez \'!quartiers\' pour voir options possibles.',
                }));
            }
        });

        // Loop through numbers and extract levels and ivs based on magnitudes
        if (numbers) {
            numbers.forEach((number) => {
                if (number >= 41 && number <= 100) {
                    ivs.push(number);
                } else if (number === 0 && levels.length > 0) {
                    // Ensures if two 0s are entered, the second goes into the ivs array
                    ivs.push(number);
                } else if (number >= 0 && number <= 40) {
                    levels.push(number);
                } else {
                    throw new Error(this.createErrorMsg({
                        english: 'Invalid number entered, must be between 0 and 100.',
                        french: 'Le nombre entré est invalide, doit être compris entre 0 et 100.',
                    }));
                }
            });
        }

        if (ivs.length + levels.length > 2) {
            throw new Error(this.createErrorMsg({
                english: 'Too many numbers entered, only enter 2 (1 for iv & 1 for level).',
                french: 'Trop de nombres entrés, entrez seulement 2 nombres (1 for iv & 1 pour niveau).',
            }));
        }

        if (ivs.length > 1) {
            throw new Error(this.createErrorMsg({
                english: 'Invalid number entered, only enter 1 number between 41 and 100.',
                french: 'Nombre invalide entré, entrez seulement 1 nombre entre 41 et 100.',
            }));
        }

        if (levels.length > 1) {
            throw new Error(this.createErrorMsg({
                english: 'Invalid number entered, only enter 1 number between 0 and 40.',
                french: 'Nombre invalide entré, entrez seulement 1 nombre compris entre 0 et 40.',
            }));
        }

        return {
            pokemonNames, neighbourhoodNames: neighbourhoodNames.sort(), ivs, levels,
        };
    }
}

module.exports = Utils;
