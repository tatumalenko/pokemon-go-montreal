const pd = require('../modules/pokedex');
const ivstr = '14 - 15 - 15 ';
const ivRegExp = /\s*(\d*)\s*-\s*(\d*)\s*-\s*(\d*)/.exec(ivstr);

const ctx = {
    iv: {
        atk: parseInt(ivRegExp[1]),
        def: parseInt(ivRegExp[2]),
        sta: parseInt(ivRegExp[3])
    }
};

let tests = [];
tests.push({
    name: 'machop',
    cp: 642,
    iv: {
        atk: 13,
        def: 15,
        sta: 15
    },
    ans: '19'
}); //lv19
tests.push({
    name: 'chansey',
    cp: 750,
    iv: {
        atk: 3,
        def: 5,
        sta: 9
    },
    ans: '??'
}); //lv?
tests.push({
    name: 'rhyhorn',
    cp: 1327,
    iv: {
        atk: 14,
        def: 13,
        sta: 15
    },
    ans: '28'
}); //lv28
tests.push({
    name: 'sableye',
    cp: 134,
    iv: {
        atk: 13,
        def: 15,
        sta: 15
    },
    ans: '??'
}); //lv?
tests.push({
    name: 'pikachu',
    cp: 592,
    iv: {
        atk: 14,
        def: 15,
        sta: 12
    },
    ans: '27'
}); //lv27
tests.push({
    name: 'lapras',
    cp: 895,
    iv: {
        atk: 7,
        def: 8,
        sta: 8
    },
    ans: '??'
}); //lv?
tests.push({
    name: 'eevee',
    cp: 519,
    iv: {
        atk: 15,
        def: 15,
        sta: 12
    },
    ans: '??'
}); //lv?
tests.push({
    name: 'onix',
    cp: 475,
    iv: {
        atk: 13,
        def: 13,
        sta: 15
    },
    ans: '17'
}); //lv17
tests.push({
    name: 'shuppet',
    cp: 89,
    iv: {
        atk: 15,
        def: 13,
        sta: 13
    },
    ans: '??'
}); //lv
tests.push({
    name: 'duskull',
    cp: 414,
    iv: ctx.iv,
    ans: '??'
}); //lv

tests.forEach((test) => {
    const pkmn = new pd.Pokemon(test);
    console.log('Calculated: ' + pkmn.calcLevel() + ', Ans: ' + test.ans);
});

let pkm = new pd.Pokemon({
    name: 'tyranitar',
    level: 31.5
});
console.log(pkm);


// console.log(pd.guessIvLevel({
//     name: 'golem',
//     cp: 1659,
//     hp: undefined
// }));

// console.log(pd.guessIvLevel({
//     name: 'golem',
//     cp: 1659,
//     hp: 104
// }));
console.log(pkm.types);
console.log(pd.getTypeMultipliers(new pd.Pokemon({
    name: 'golem'
}).types));