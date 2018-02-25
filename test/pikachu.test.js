const { test } = require('ava');
const Utils = require('../src/utils/Utils');

test('Utils.js:parseWildPreferenceQueryFromArgs', (t) => {
    const cases = [];
    cases.deepEqual = [
        {
            input: 'pidgey 100',
            expected: {
                pokemonNames: ['pidgey'],
                neighbourhoodNames: [],
                ivs: [100],
                levels: [],
            },
        },
        {
            input: 'weedle village',
            expected: {
                pokemonNames: ['weedle'],
                neighbourhoodNames: ['village'],
                ivs: [],
                levels: [],
            },
        },
        {
            input: 'all village rosemont 0 0',
            expected: {
                pokemonNames: ['all'],
                neighbourhoodNames: ['rosemont', 'village'],
                ivs: [0],
                levels: [0],
            },
        },
        {
            input: 'blissey tyranitar weedle village rosemont iv0 level 0',
            expected: {
                pokemonNames: ['blissey', 'tyranitar', 'weedle'],
                neighbourhoodNames: ['rosemont', 'village'],
                ivs: [0],
                levels: [0],
            },
        },
    ];
    cases.throws = [
        {
            input: 'all 60 80',
            expected: /only enter 1 number between 41 and 100/,
        },
        {
            input: 'all 0 0 80',
            expected: /Too many numbers entered, only enter 2/,
        },
        {
            input: 'all someplace 0 0',
            expected: /Invalid entry. Enter '!neighbourhoods' to see possible options/,
        },
    ];

    cases.deepEqual.forEach((item) => {
        printIO(item, Utils.parseWildPreferenceQueryFromArgs);
        t.deepEqual(Utils.parseWildPreferenceQueryFromArgs(item.input), item.expected);
    });

    cases.throws.forEach((item) => {
        const error = t.throws(() => {
            Utils.parseWildPreferenceQueryFromArgs(item.input);
        }, Error);
        printIE(item, error);
        t.truthy(item.expected.exec(error.message));
    });
});

function printIO(item, foo) {
    console.log('\x1b[36m%s\x1b[0m', '++++++++++++++++++++++++++++++++++++++++');
    console.log('\x1b[32m%s\x1b[0m', 'Input:');
    console.log('\x1b[35m%s\x1b[0m', `   '${item.input}'`);
    console.log('\x1b[32m%s\x1b[0m', 'Output:');
    console.log('\x1b[35m%s\x1b[0m', foo(item.input));
}

function printIE(item, error) {
    console.log('\x1b[36m%s\x1b[0m', '++++++++++++++++++++++++++++++++++++++++');
    console.log('\x1b[32m%s\x1b[0m', 'Input:');
    console.log('\x1b[35m%s\x1b[0m', `   '${item.input}'`);
    console.log('\x1b[32m%s\x1b[0m', 'Output:');
    console.log('\x1b[35m%s\x1b[0m', `   '${error.message.split('\n').join('\n   ')}'`);
}

// eslint-disable-next-line no-extend-native, func-names
Object.prototype.toString = function () {
    const keys = Object.keys(this);

    let str = '   {';
    keys.forEach((key) => {
        str += `\n      ${key}: ${Array.isArray(this[key]) ? '[' : ''}${Array.isArray(this[key]) ? this[key].join(', ') : this[key]}${Array.isArray(this[key]) ? ']' : ''}`;
    });
    str += '\n   }';

    return str;
};

