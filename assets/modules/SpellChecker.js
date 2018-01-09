const didYouMean = require('didyoumean2');
const _ = require('lodash');
const neighbourhoods = require('../data/neighbourhood_synonyms').neighbourhood_dict;
const DictUtils = require('./DictUtils');

const dictutils = new DictUtils();

const isEmpty = obj => Object.keys(obj).length === 0;
const has = Object.prototype.hasOwnProperty; // Cache the lookup once, in module scope.


class SpellChecker {
    constructor(dict, options) {
        const newOptions = {
            caseSensitive: false,
            deburr: true,
            matchPath: '',
            returnType: 'all-closest-matches', // 'all-closest-matches' | 'all-matches' | 'all-sorted-matches' | 'first-closest-match' | 'first-match' | 'random-closest-match'
            trimSpace: true,
            thresholdType: 'edit-distance', // 'similarity' | 'edit-distance'
        };
        if (newOptions.thresholdType === 'similarity') newOptions.threshold = 0.4;
        else if (newOptions.thresholdType === 'edit-distance') newOptions.threshold = 20;

        Object.keys(newOptions).forEach((optionKey) => {
            if (options && has.call(options, optionKey)) {
                newOptions[optionKey] = options[optionKey];
            }
        });

        this.dict = isEmpty(dict) ? { pokemon: [...dictutils.getPokemonNamesArray(), ...dictutils.getPokemonNamesArray('french')], neighbourhoods } : dict;
        this.dictList = _.flattenDeep(_.toArray(this.dict));
        this.options = newOptions;
    }

    correct(input) {
        const corrections = didYouMean(input, this.dictList, this.options);

        const options2 = _.clone(this.options);
        options2.thresholdType = 'edit-distance';
        options2.threshold = 2;
        const corrections2 = didYouMean(input, this.dictList, options2);

        this.dictList.forEach((word) => {
            if (word.includes(input) && word.charAt(0) === input.charAt(0)) corrections.push(word);
        });

        const allCorrections = [...corrections, ...corrections2];
        const formattedStr = ['\n(alphabetical): ', _.uniq(allCorrections).sort().join(', '), '\n(likelihood): ', ..._.uniq(allCorrections).join(', ')].join('');

        return _.isEmpty(allCorrections) ? '' : formattedStr;
    }
}

module.exports = SpellChecker;

// const options = { returnType: 'all-matches', thresholdType: 'similarity', threshold: 0.55 };
// const speller = new SpellChecker(big, options);

// console.log(speller.options);
// const log = input => console.log(`${input}:`, speller.correct(input).join(', '));
// log('quaefr-latjn');
// log('rsmot');
// log('char');
// log('bulasru');
// log('soodowodo');
// log('nidoran');
// log('chansy');
// log('plus');
// log('rfp');
// log('stpaul');
