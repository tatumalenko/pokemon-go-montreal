const { test } = require('ava');
const { parseQueryFromArgs } = require('../src/bots/pikachu/commands/want');

// const createMockWildPref = (name, neighbourhoods, iv, level) => ({
//     name,
//     neighbourhoods,
//     iv,
//     level,
// });

// console.log(createMockWildPref('blissey', ['everywhere'], 0, 0));

test('want.js:parseQueryFromArgs', (t) => {
    const cases = [];
    cases.deepEqual = [
        {
            input: 'pidgey 100',
            expected: [{
                name: 'pidgey',
                neighbourhoods: [''],
                iv: 100,
                level: 0,
            }],
        },
        {
            input: 'weedle village',
            expected: [{
                name: 'weedle',
                neighbourhoods: ['village'],
                iv: 0,
                level: 0,
            }],
        },
        {
            input: 'all village rosemont 0 0',
            expected: [{
                name: 'all',
                neighbourhoods: ['rosemont', 'village'],
                iv: 0,
                level: 0,
            }],
        },
        {
            input: 'blissey tyranitar weedle village rosemont iv0 level 0',
            expected: [{
                name: 'blissey',
                neighbourhoods: ['rosemont', 'village'],
                iv: 0,
                level: 0,
            },
            {
                name: 'tyranitar',
                neighbourhoods: ['rosemont', 'village'],
                iv: 0,
                level: 0,
            },
            {
                name: 'weedle',
                neighbourhoods: ['rosemont', 'village'],
                iv: 0,
                level: 0,
            }],
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
        t.deepEqual(parseQueryFromArgs(item.input), item.expected, item.msg);
    });

    cases.throws.forEach((item) => {
        const error = t.throws(() => {
            parseQueryFromArgs(item.input);
        }, Error);
        t.truthy(item.expected.exec(error.message));
    });
});

// test('want.js:createWildPreferenceString', (t) => {
//     t.
// });

