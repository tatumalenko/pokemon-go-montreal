// new pd.Pokemon( {'name': dco.msg.args[0], 'cp': cp ? cp : 0, 'level': level ? level : 20} )
// level is implicitly taken care of (assumes 20), cp is set to 0 to be handled in Pkmn constructor

const db = {};
db.pkmn = require('../../../../lib/pokemongo-json-pokedex/output/pokemon.json');
db.move = require('../../../../lib/pokemongo-json-pokedex/output/move.json');
db.tc = require('../data/typechart.json');

class Pokemon {
    constructor(ctx) {
        if (!ctx.name) throw 'Pokemon.constructor: ctx.name is undefined';
        if (!isPokemonName(ctx.name)) throw 'Pokemon.constructor: ctx.name is not a valid name';

        const pkmn = search(db.pkmn, 'name', ctx.name);
        this.name = pkmn.name;
        this.dex = pkmn.dex;
        this.types = [];
        pkmn.types.forEach(type => this.types.push(type.name));
        this.level = (ctx.level || ctx.level == 0) ? ctx.level : 40; // Assume max Pokemon level
        this.cpm = this.calcCpm(this.level);
        ctx.iv ? this.iv = ctx.iv : this.iv = {
            atk: 15,
            def: 15,
            sta: 15,
        }; // Assume perfect IVs
        this.iv.percent = (100 * (this.iv.atk + this.iv.def + this.iv.sta) / 45);
        if (Math.abs(this.iv.percent - Math.floor(this.iv.percent)) !== 0) { this.iv.percent = this.iv.percent.toFixed(1); }
        this.stats = {
            base: {},
            effective: {},
        };
        this.stats.base = {
            atk: pkmn.stats.baseAttack,
            def: pkmn.stats.baseDefense,
            sta: pkmn.stats.baseStamina,
        };

        // By giving ctx.cp = 0, suggests that cp will be iterated for cpComboStr (checked in statInfo)?
        this.cp = (ctx.cp || ctx.cp == 0) ? ctx.cp : this.calcCp(); // If undefined and not = 0, calcCp()

        this.level = (ctx.level && ctx.level != 0) ? ctx.level : this.calcLevel(); // If undefined and not = 0, calcLevel()
        this.cpm = this.cpm ? this.cpm : this.calcCpm(this.level);

        this.stats.effective = {
            atk: (this.stats.base.atk + this.iv.atk) * this.cpm,
            def: (this.stats.base.def + this.iv.def) * this.cpm,
            sta: (this.stats.base.sta + this.iv.sta) * this.cpm,
        };
        this.hp = Math.floor(this.stats.effective.sta);

        // By giving ctx.cp = 0, suggests that cp will be iterated for cpComboStr (checked in statInfo)?
        this.cp = (ctx.cp || ctx.cp == 0) ? ctx.cp : this.calcCp(); // If undefined and not = 0, calcCp()
        this.level = this.level ? this.level : 40;

        this.moves = {
            fast: [],
            charge: [],
        };
        pkmn.quickMoves.forEach(move => this.moves.fast.push(new Move({
            name: move.name,
        })));
        pkmn.cinematicMoves.forEach(move => this.moves.charge.push(new Move({
            name: move.name,
        })));

        this.movesets = [];
        this.moves.fast.forEach((fastMv) => {
            this.moves.charge.forEach((chargeMv) => {
                this.movesets.push({
                    fast: fastMv,
                    charge: chargeMv,
                    dps: this.calcDps(fastMv, chargeMv),
                    // damageOutput: this.calcDamageOutput(fastMv, chargeMv),
                    weaveDP100S: this.calcWeaveDP100S(fastMv, chargeMv),
                    weaveGymDP100S: this.calcWeaveGymDP100S(fastMv, chargeMv),
                    gymOffense: this.calcGymOffense(fastMv, chargeMv),
                    gymDefense: this.calcGymDefense(fastMv, chargeMv),
                    tankiness: this.calcTankiness(),
                    duelAbility: this.calcDuelAbility(fastMv, chargeMv),
                });
            });
        });


        const maxGymOffense = (this.movesets.reduce((a, c) => (a.gymOffense > c.gymOffense ? a : c))).gymOffense;
        // const maxDuelAbility = (this.movesets.reduce((a, c) => a.duelAbility > c.duelAbility ? a : c)).duelAbility;
        const maxGymDefense = (this.movesets.reduce((a, c) => (a.gymDefense > c.gymDefense ? a : c))).gymDefense;
        for (let i = 0; i < this.movesets.length; i++) {
            this.movesets[i].offensePerfection = 100 * (this.movesets[i].gymOffense) / maxGymOffense;
            // this.movesets[i].defensePerfection = 100*(this.movesets[i].duelAbility)/maxDuelAbility;
            this.movesets[i].defensePerfection = 100 * (this.movesets[i].gymDefense) / maxGymDefense;
        }

    // this.movesets.sort((a, b) => b.offensePerfection - a.offensePerfection)
    // this.movesets.sort((a, b) => b.defensePerfection - a.defensePerfection)
    }

    reCalc(ctx) {
        this.cpm = this.calcCpm(ctx.level);
        this.iv = ctx.iv;

        this.stats.effective = {
            atk: (this.stats.base.atk + this.iv.atk) * this.cpm,
            def: (this.stats.base.def + this.iv.def) * this.cpm,
            sta: (this.stats.base.sta + this.iv.sta) * this.cpm,
        };

        this.cp = this.calcCp();
        this.hp = Math.floor(this.stats.effective.sta);

        return this;
    }

    calcCpm(level) {
        const cpm = function (lv) {
            const a = [0.094, 0.16639787, 0.21573247, 0.25572005, 0.29024988, 0.3210876, 0.34921268, 0.3752356, 0.39956728, 0.4225, 0.44310755, 0.4627984, 0.48168495, 0.49985844, 0.51739395, 0.5343543, 0.5507927, 0.5667545, 0.5822789, 0.5974, 0.6121573, 0.6265671, 0.64065295, 0.65443563, 0.667934, 0.6811649, 0.69414365, 0.7068842, 0.7193991, 0.7317, 0.7377695, 0.74378943, 0.74976104, 0.7556855, 0.76156384, 0.76739717, 0.7731865, 0.77893275, 0.784637, 0.7903];
            return a[lv - 1];
        };

        if (level % 1 !== 0) {
            return (cpm(Math.floor(level)) ** 2 + (cpm(Math.ceil(level)) ** 2 - cpm(Math.floor(level)) ** 2) / 2) ** 0.5;
        } return cpm(level);
    }

    calcLevel() {
        const cpm =
            (10 * this.cp / (
                (this.stats.base.atk + this.iv.atk) *
                (this.stats.base.def + this.iv.def) ** 0.5 *
                (this.stats.base.sta + this.iv.sta) ** 0.5)) ** 0.5;

        let guess;
        let deltas = [],
            lvs = [];
        for (let i = 1; i < 40; i += 0.5) {
            guess = this.calcCpm(i);
            lvs.push(i);
            deltas.push(Math.abs(cpm - guess) / cpm);
        }
        return lvs[deltas.indexOf(Math.min(...deltas))];
    }

    calcCp() {
        return 1 / 10 * this.stats.effective.atk * this.stats.effective.def ** 0.5 * this.stats.effective.sta ** 0.5;
    }

    calcDpe(move) {
        return (Math.floor(0.5 * move.power * this.stats.effective.atk * (this.types.some(type => move.type.compare(type)) ? 1.2 : 1.0)) + 1) / move.energy;
    }

    calcTpe(move) {
        return move.time / move.energy;
    }

    calcDps(fastMv, chargeMv) {
        return ((this.calcDpe(fastMv) + this.calcDpe(chargeMv)) / (this.calcTpe(fastMv) + this.calcTpe(chargeMv)));
    }

    calcDpsNoStab(fastMv, chargeMv) {
        const calcDpeNoStab = move => (Math.floor(0.5 * move.power * this.stats.effective.atk * 1.0) + 1) / move.energy;
        return ((calcDpeNoStab(fastMv) + calcDpeNoStab(chargeMv)) / (this.calcTpe(fastMv) + this.calcTpe(chargeMv)));
    }

    calcDamageOutput(fastMv, chargeMv) {
        return this.calcDps(fastMv, chargeMv) * this.stats.effective.atk;
    }

    calcDamageOutputNoStab(fastMv, chargeMv) {
        return this.calcDpsNoStab(fastMv, chargeMv) * this.stats.effective.atk;
    }

    calcTankiness() {
        return this.stats.effective.def * this.hp;
    }

    calcDuelAbility(fastMv, chargeMv) {
    // return this.calcDamageOutput(fastMv, chargeMv) * this.calcTankiness();
    // return this.calcDamageOutputNoStab(fastMv, chargeMv) * this.calcTankiness();
        return this.calcGymOffense(fastMv, chargeMv) * this.calcTankiness();
    }

    calcGymOffense(fastMv, chargeMv) {
        return this.calcWeaveDP100S(fastMv, chargeMv) * this.stats.effective.atk;
    }

    calcGymDefense(fastMv, chargeMv) {
        return this.calcWeaveGymDP100S(fastMv, chargeMv) * this.calcTankiness() * this.stats.effective.atk;
    }

    calcWeaveDP100S(fastMv, chargeMv) {
        const f = {
            power: fastMv.power,
            energy: fastMv.energy,
            time: fastMv.time,
            stab: this.types.some(type => fastMv.type.compare(type)),
        };
        const c = {
            power: chargeMv.power,
            energy: chargeMv.energy,
            time: chargeMv.time,
            stab: this.types.some(type => chargeMv.type.compare(type)),
        };
        const chargeDelay = 500;
        const cpfEnergy = c.energy == 100 ? Math.ceil(c.energy / f.energy) : c.energy / f.energy;
        const weaveCL = cpfEnergy * f.time + (c.time + chargeDelay);
        const nCharge = Math.floor(100000 / weaveCL);
        return nCharge * (c.power * (1 + c.stab * 0.2) * (1 + (0))) + Math.ceil(nCharge * cpfEnergy) * (f.power * (1 + (f.stab * 0.2))) + Math.floor((100000 - (nCharge * (c.time + chargeDelay) + Math.ceil(nCharge * cpfEnergy) * f.time)) / f.time) * (f.power * (1 + (f.stab * 0.2)));
    }

    calcWeaveGymDP100S(fastMv, chargeMv) {
        const f = {
            power: fastMv.power,
            energy: fastMv.energy,
            time: fastMv.time,
            stab: this.types.some(type => fastMv.type.compare(type)),
        };
        const c = {
            power: chargeMv.power,
            energy: chargeMv.energy,
            time: chargeMv.time,
            stab: this.types.some(type => chargeMv.type.compare(type)),
        };
        const chargeDelay = 500;
        const cpfEnergy = c.energy == 100 ? Math.ceil(c.energy / f.energy) : c.energy / f.energy;
        const weaveGymCL = cpfEnergy * (f.time + 2000) + (c.time + chargeDelay);
        const nCharge = Math.floor(100000 / weaveGymCL);
        return nCharge * (c.power * (1 + c.stab * 0.2)) + Math.ceil(nCharge * cpfEnergy) * (f.power * (1 + (f.stab * 0.2))) + Math.floor((100000 - (nCharge * (c.time + chargeDelay) + Math.ceil(nCharge * cpfEnergy) * (f.time + 2000))) / (f.time + 2000)) * (f.power * (1 + (f.stab * 0.2)));
    }
}

class Move {
    constructor(ctx) {
        if (!ctx.name) throw 'Move.constructor: ctx.name is undefined';
        if (!isMoveName(ctx.name)) throw 'Move.constructor: ctx.name is not a valid name';

        let mv;

        if (search(db.move, 'name', ctx.name)) {
            mv = search(db.move, 'name', ctx.name);
            this.kind = 'Charge';
        } else if (search(db.move, 'name', `${ctx.name} fast`)) {
            mv = search(db.move, 'name', `${ctx.name} fast`);
            this.kind = 'Fast';
        }

        this.name = mv.name.replace(/ Fast/i, '');
        this.type = mv.pokemonType.name;
        this.power = mv.power;
        this.time = mv.durationMs;
        this.energy = Math.abs(mv.energyDelta);
    }
}

// Returns context object with the Pokemon's info (base stats, possible move sets)
// Called by slowpoke-bot like `dco.channel.send({embed: pd.pokemonInfo(new pd.Pokemon({'name': dco.msg.args[0]}))});`
// Since no level or cp is given, assumes level 40 and calculates cp in constructor based on perfect iv values
function pokemonInfo(pokemon) {
    // Create the base stat str for pokemon
    const statStr = `${'__**STATS**__' + ' `(atk|def|sta)`\n`▶︎` `'}${pokemon.stats.base.atk}|${pokemon.stats.base.def}|${pokemon.stats.base.sta}\``;
    // Create the move set str for the pokemon
    const movesStr = moveStr(pokemon);

    const typeMultipliersStr = {}; // 'Weak Against:\n';
    let weakAgainstStr = '`▶︎` **Weak Against:**';
    let strongAgainstStr = '\n`▶︎` **Strong Against:**';
    const typeMultiplersArr = [];

    const typeMultiplers = getTypeMultipliers(pokemon.types);

    for (const multiplier in typeMultiplers) {
        if (typeMultiplers.hasOwnProperty(multiplier)) {
            if (typeMultipliersStr.hasOwnProperty(typeMultiplers[multiplier])) {
                typeMultipliersStr[typeMultiplers[multiplier]].push(multiplier);
            } else { typeMultipliersStr[typeMultiplers[multiplier]] = [multiplier]; }
        }
    }

    if (typeMultipliersStr.hasOwnProperty('1.96')) {
        weakAgainstStr += `\n      \`1.96x\`: ${typeMultipliersStr['1.96'].map(type => typeCode({
            type,
        })).join('|')}`;
    }
    if (typeMultipliersStr.hasOwnProperty('1.4')) {
        weakAgainstStr += `\n      \`1.4x\`: ${typeMultipliersStr['1.4'].map(type => typeCode({
            type,
        })).join('|')}`;
    }
    if (typeMultipliersStr.hasOwnProperty('0.51')) {
        strongAgainstStr += `\n      \`0.51x\`: ${typeMultipliersStr['0.51'].map(type => typeCode({
            type,
        })).join('|')}`;
    }
    if (typeMultipliersStr.hasOwnProperty('0.714')) {
        strongAgainstStr += `\n      \`0.714x\`: ${typeMultipliersStr['0.714'].map(type => typeCode({
            type,
        })).join('|')}`;
    }
    // console.log(strongAgainstStr);

    return [{
        title: `#${pokemon.dex} ${pokemon.name.toUpperCase()}`,
        url: `https://db.pokemongohub.net/pokemon/${pokemon.dex}`,
        color: typeColor(pokemon),
        thumbnail: {
            url: `https://pkmref.com/images/set_1/${pokemon.dex}.png`,
        },

        description: `__**CP: ${Math.floor(pokemon.cp)} | LV: ${pokemon.level} | IV: ${pokemon.iv.percent}**__\n\n` +
                `__**TYPE**__ \n\`▶︎\` ${typeStr(pokemon)}\n\n${
                    weakAgainstStr}${strongAgainstStr}\n\n` +
                `${statStr}\n\n`, //+
    // '__**FAST MOVES**__ \n' + movesStr.fast + '\n\n' +
    // '__**CHARGE MOVES**__ \n' + movesStr.charge + '\n\n' //+
    // '__**MOVESET RATINGS**__ \n' + movesetStr(pokemon) + '\n\n'
    },
    {
        color: typeColor(pokemon),
        description: `__**FAST MOVES**__ \n${movesStr.fast}\n\n` +
                `__**CHARGE MOVES**__ \n${movesStr.charge}\n\n`,
    },
    {
        color: typeColor(pokemon),
        description: `__**MOVESET RATINGS**__ \n${movesetStr(pokemon)}\n\n`,
    },
    ];
}

// Returns context object with the move set info
// Requires key-value pairs for move name, type, kind, power, time
function moveInfo(move) {
    const epsStr = move.kind.includes('Charge') ? '' : `${'**Approx. EPS**: ' + '`'}${(move.energy / move.time * 1000).toFixed(1)}\`\n`;

    return {
        title: move.name,
        url: `https://db.pokemongohub.net/moves/${move.type.toLowerCase()}`,
        description: `**${move.kind} Move**\n` +
            `**Type**: ${typeCode(move)}${move.type}\n` +
            '**Power**: ' + `\`${move.power}\`\n` +
            '**Energy**: ' + `\`${move.energy}\`\n` +
            '**Duration** (sec): ' + `\`${move.time / 1000}\`\n` +
            '**Approx. DPS**: ' + `\`${(move.power / move.time * 1000).toFixed(1)}\`\n${
            epsStr
        }*Note: Approx. DPS is actually power per second*\n`,
        color: typeColor(move),
    };
}

// Returns embed of all possible stat combos for various inputs
// Called by slowpoke-bot: `dco.channel.send({embed: pd.statInfo( new pd.Pokemon( {'name': dco.msg.args[0], 'cp': cp ? cp : 0, 'level': level ? level : 20} ) )});`
// If cp = 0, calls `cpComboStr(pokemon)`, implies cp was not given, returns all possible stats for iv% > 90 and level = pokemon.level
// If cp != 0, calls `ivComboStr(pokemon)`, implies fixed value to narrow search in
// level is fixed since `'level': level ? level : 20`, i.e. assume raid boss level if level not given
function statInfo(pokemon) {
    let statComboStr;
    if (pokemon.cp != 0) {
    // Display all iv combos for pokemon.cp & pokemon.level
        statComboStr = ivComboStr(pokemon);
        pokemon.cp = pokemon.calcCp();
    } else {
    // Display all cp combos for iv% > 90 & pokemon.level
        statComboStr = cpComboStr(pokemon);
        pokemon.cp = pokemon.calcCp();
    }

    const embed = {
        title: `#${pokemon.dex} ${pokemon.name.toUpperCase()}`,
        url: `https://db.pokemongohub.net/pokemon/${pokemon.dex}`,
        description: `**CP: ${Math.floor(pokemon.cp)} | LV: ${pokemon.level} | IV: ${pokemon.iv.percent}**\n` +
            `**Type**: ${typeStr(pokemon)}\n` +
            `\`${statComboStr}\``,
        color: typeColor(pokemon),
        thumbnail: {
            url: `https://pkmref.com/images/set_1/${pokemon.dex}.png`,
        },
    };

    if (embed.description.length > 2047) {
        embed.description = `${embed.description.substring(0, 2047 - 4)}...\``;
    }
    return embed;
}

function statInfo2(ctx) {
    let statComboStr;

    if (ctx.cp && ctx.hp) {
        statComboStr = levelComboStr(ctx);
    }
    const pokemon = new Pokemon({
        name: ctx.name,
    });
    // if (ctx.cp != 0) {
    //     // Display all iv combos for pokemon.cp & pokemon.level
    //     statComboStr = ivComboStr(pokemon);
    //     pokemon.cp = pokemon.calcCp();
    // } else {
    //     // Display all cp combos for iv% > 90 & pokemon.level
    //     statComboStr = cpComboStr(pokemon);
    //     pokemon.cp = pokemon.calcCp();
    // }
    // console.log(statComboStr);

    const embed = {
        title: `#${pokemon.dex} ${pokemon.name.toUpperCase()}`,
        url: `https://db.pokemongohub.net/pokemon/${pokemon.dex}`,
        description: `**CP: ${Math.floor(pokemon.cp)} | LV: ${pokemon.level} | IV: ${pokemon.iv.percent}**\n` +
            `**Type**: ${typeStr(pokemon)}\n` +
            `\`${statComboStr}\``,
        color: typeColor(pokemon),
        thumbnail: {
            url: `https://pkmref.com/images/set_1/${pokemon.dex}.png`,
        },
    };

    if (embed.description.length > 2047) {
        embed.description = `${embed.description.substring(0, 2047 - 4)}...\``;
    }
    return embed;
}

function isPokemonName(name) {
    return !!search(db.pkmn, 'name', name);
}

function isMoveName(name) {
    return search(db.move, 'name', name) ? true : (!!search(db.move, 'name', `${name} Fast`));
}

function clean(name) { // Used in search() function to correct/match naming intricacies found in GM file
    let cleanName = name;
    const mapReplace = {
        '\'': '',
        '’': '',
        '-': ' ',
        '.': '',
    };

    for (const key in mapReplace) {
        cleanName = cleanName.replace(key, mapReplace[key]);
    }

    return cleanName;
}

function search(source, key, value) {
    return source.filter(el => el[key].compare(clean(value)))[0];
}

function typeColor(obj) {
    const tc = {
        normal: 'A8A77A',
        fire: 'EE8130',
        water: '54a9da',
        electric: 'F7D02C',
        grass: '7AC74C',
        ice: '96D9D6',
        fighting: 'C22E28',
        poison: 'A33EA1',
        ground: 'E2BF65',
        flying: 'A98FF3',
        psychic: 'F95587',
        bug: 'A6B91A',
        rock: 'B6A136',
        ghost: '735797',
        dragon: '0076bb', // '6F35FC',
        dark: '705746',
        steel: 'B7B7CE',
        fairy: 'D685AD',
    };

    const hex2dec = hex => parseInt(hex, 16).toString(10);

    return obj.constructor.name.compare('Pokemon') ? hex2dec(tc[obj.types[0].toLowerCase()]) : hex2dec(tc[obj.type.toLowerCase()]);
}

function typeCode(obj) {
    const tc = {
        bug: '<:bug1:352708124983164929>',
        dark: '<:dark:352708125159325696>',
        electric: '<:electric:352708125259857920>',
        fairy: '<:fairy:352708125071114240>',
        flying: '<:flying:352708125150674954>',
        fighting: '<:fighting:352708124978839554>',
        fire: '<:fire1:352708125138223104>',
        ghost: '<:ghost1:352708125196812290>',
        grass: '<:grass:352708125742333952>',
        ground: '<:ground:352708125498802187>',
        ice: '<:ice:352708125763174400>',
        normal: '<:normal:352708125696196608>',
        poison: '<:poison:352708125851254794>',
        psychic: '<:psychic:352708125201268748>',
        rock: '<:rock:352708125679157268>',
        steel: '<:steel:352708125893328896>',
        water: '<:water:352708125855449088>',
        dragon: '<:dragon1:352708125217783838>',
    };

    if (obj.constructor.name.compare('Pokemon')) {
        if (obj.types.length === 1) return tc[obj.types[0].toLowerCase()];
        return [tc[obj.types[0].toLowerCase()], tc[obj.types[1].toLowerCase()]];
    }
    return tc[obj.type.toLowerCase()];
}

function typeStr(obj) {
    if (obj.types.length === 1) {
        return `${typeCode(obj)} \`${obj.types[0]}\``;
    }
    return `${typeCode(obj)[0]} \`${obj.types[0]} | \`${typeCode(obj)[1]} \`${obj.types[1]}\``;
}

function moveStr(obj) {
    let fastStr = '';
    let chargeStr = '';
    if (obj.constructor.name.compare('Pokemon')) {
        const tempFastArr = [];
        const tempChargeArr = [];
        const tempFastStatArr = [
            [],
            [],
            [],
        ];
        const tempChargeStatArr = [
            [],
            [],
            [],
        ];
        for (let i = 0; i < obj.moves.fast.length; i += 1) {
            tempFastArr.push(obj.moves.fast[i].name);
            tempFastStatArr[0].push(`${obj.moves.fast[i].power}`);
            tempFastStatArr[1].push(`${obj.moves.fast[i].energy}`);
            tempFastStatArr[2].push(`${obj.moves.fast[i].time / 1000}`);
        }
        for (let i = 0; i < obj.moves.charge.length; i += 1) {
            tempChargeArr.push(obj.moves.charge[i].name);
            tempChargeStatArr[0].push(`${obj.moves.charge[i].power}`);
            tempChargeStatArr[1].push(`${obj.moves.charge[i].energy}`);
            tempChargeStatArr[2].push(`${obj.moves.charge[i].time / 1000}`);
        }
        const maxFastStrLength = tempFastArr.reduce((a, c) => (a.length > c.length ? a : c)).length;
        const maxChargeStrLength = tempChargeArr.reduce((a, c) => (a.length > c.length ? a : c)).length;
        const maxFastStatStrLength = [];
        maxFastStatStrLength[0] = tempFastStatArr[0].reduce((a, c) => (a.length > c.length ? a : c)).length;
        maxFastStatStrLength[1] = tempFastStatArr[1].reduce((a, c) => (a.length > c.length ? a : c)).length;
        maxFastStatStrLength[2] = tempFastStatArr[2].reduce((a, c) => (a.length > c.length ? a : c)).length;
        const maxChargeStatStrLength = [];
        maxChargeStatStrLength[0] = tempChargeStatArr[0].reduce((a, c) => (a.length > c.length ? a : c)).length;
        maxChargeStatStrLength[1] = tempChargeStatArr[1].reduce((a, c) => (a.length > c.length ? a : c)).length;
        maxChargeStatStrLength[2] = tempChargeStatArr[2].reduce((a, c) => (a.length > c.length ? a : c)).length;

        for (let i = 0; i < obj.moves.fast.length; i += 1) {
            if (i !== 0) fastStr += ' \n';

            let tempStr = '';
            tempStr = `\`▶︎\` **${obj.moves.fast[i].name.replace(/ Fast/i, '')}:**`;
            fastStr = `${fastStr + tempStr}\n      <:power1:385003640622153728>\`${obj.moves.fast[i].power}|\`<:lightning1:385004007669891072>\`${obj.moves.fast[i].energy}|\`<:stopwatch1:385003619302506498>\`${obj.moves.fast[i].time / 1000}\``;
        }

        for (let i = 0; i < obj.moves.charge.length; i += 1) {
            if (i !== 0) chargeStr += ' \n';

            let tempStr = '';
            tempStr = `\`▶︎\` **${obj.moves.charge[i].name}:**`;
            chargeStr = `${chargeStr + tempStr}\n      <:power1:385003640622153728>\`${obj.moves.charge[i].power}|\`<:lightning1:385004007669891072>\`${obj.moves.charge[i].energy}|\`<:stopwatch1:385003619302506498>\`${obj.moves.charge[i].time / 1000}\``;
        }
    }

    return {
        fast: fastStr,
        charge: chargeStr,
    };
}

function movesetStr(obj) {
    if (!obj.constructor.name.compare('Pokemon')) return;
    // console.log('pokemon.movesets[0].weaveDP100S :\n' + obj.movesets[0].weaveDP100S);
    // console.log('pokemon.movesets[0].gymOffense: \n' + obj.movesets[0].gymOffense);
    // console.log('pokemon.movesets[0].weaveGymDP100S: \n' + obj.movesets[0].weaveGymDP100S);
    // console.log('pokemon.movesets[0].gymDefense: \n' + obj.movesets[0].gymDefense);

    obj.movesets.sort((a, b) => b.offensePerfection - a.offensePerfection);

    const tempArr = [];
    for (let i = 0; i < obj.movesets.length; i += 1) {
        tempArr.push(`${obj.movesets[i].fast.name}/${obj.movesets[i].charge.name}`);
    }

    const maxStrLength = tempArr.reduce((a, c) => (a.length > c.length ? a : c)).length;
    let str = '';
    for (let i = 0; i < obj.movesets.length; i += 1) {
        let tempStr = '';
        tempStr = `\`▶︎\` **${obj.movesets[i].fast.name}/${obj.movesets[i].charge.name}:**\n`;
        str = `${str + tempStr}      <:swords1:385001990268125184>\`${Math.round(obj.movesets[i].offensePerfection)}%` + `|\`<:shield1:385001970391318538>\`${Math.round(obj.movesets[i].defensePerfection)}%` + '`\n';
    }

    return str;
}

function levelComboStr(ctx) {
    // Display all cp combos for iv% > 90 & pokemon.level
    const ivLevelGuess = (cp, hp) => {
        const stats = [];
        let percent = 0;
        let pkmn = new Pokemon({
            name: ctx.name,
            level: 1,
        });
        for (let lv = 1; lv < 41; lv += 0.5) {
            for (let i = 1; i < 15; i += 1) {
                for (let j = 1; j < 15; j += 1) {
                    for (let k = 1; k < 15; k += 1) {
                        percent = ((i + j + k + 3) / 45) * 100;

                        pkmn = pkmn.reCalc({
                            level: lv,
                            iv: {
                                atk: i + 1,
                                def: j + 1,
                                sta: k + 1,
                            },
                        });

                        if (cp == Math.floor(pkmn.cp)) {
                            if (!hp) {
                                stats.push([
                                    i + 1,
                                    j + 1,
                                    k + 1,
                                    parseFloat(percent.toFixed(1)),
                                    Math.floor(pkmn.cp),
                                    pkmn.hp,
                                    lv,
                                ]);
                            } else if (hp == pkmn.hp) {
                                stats.push([
                                    i + 1,
                                    j + 1,
                                    k + 1,
                                    parseFloat(percent.toFixed(1)),
                                    Math.floor(pkmn.cp),
                                    pkmn.hp,
                                    lv,
                                ]);
                            }
                        }
                    }
                }
            }
        }

        // console.timeEnd('cpComboStr');

        return stats.sort((a, b) => b[3] - a[3]); // Ordered by descending cp values
    };

    // console.log(ctx);
    const stats = ivLevelGuess(ctx.cp, ctx.hp);

    let str = '';
    if (stats.length > 0) {
        const tempStr = '';
        // Header
        str = `CP=${ctx.cp}, HP=${ctx.hp}\n` + 'Possible IV Combinations:\n';
        str += 'AT|DE|ST LV   IV\n';

        // Entries as rows
        for (let i = 0; i < stats.length; i++) {
            stats[i] = stats[i].map(e => e.toString());
            str += `${stats[i][0].padStart(2)}|${stats[i][1].padStart(2)}|${stats[i][2].padEnd(2)} ${stats[i][6].padEnd(4)} ${Math.round(stats[i][3])}%\n`;
        }
    } else {
        str = `No possible IV combinations found for CP = ${pokemon.cp}`;
    }
    // console.timeEnd('ivComboStr');
    return str;
}

// Called by `statInfo(pokemon)`: `if (pokemon.cp == 0) {statComboStr = cpComboStr(pokemon); ..}`
function cpComboStr(pokemon) {
    console.time('cpComboStr');
    // Display all cp combos for iv% > 90 & pokemon.level
    const cpGuess = (pokemon) => {
        const stats = [];
        let percent = 0;

        let pkmn = new Pokemon({
            name: pokemon.name,
            level: pokemon.level,
        });

        for (let i = 1; i < 15; i += 1) {
            for (let j = 1; j < 15; j += 1) {
                for (let k = 1; k < 15; k += 1) {
                    percent = ((i + j + k + 3) / 45) * 100;

                    if (percent >= 90) {
                        pkmn = pkmn.reCalc({
                            level: pokemon.level,
                            iv: {
                                atk: i + 1,
                                def: j + 1,
                                sta: k + 1,
                            },
                        });

                        stats.push([i + 1, j + 1, k + 1, percent.toFixed(1), Math.floor(pkmn.cp), pkmn.hp]);
                    }
                }
            }
        }

        console.timeEnd('cpComboStr');
        return stats.sort((a, b) => b[4] - a[4]); // Ordered by descending cp values
    };

    const stats = cpGuess(pokemon);
    let str = '';
    if (stats.length > 0) {
        str = 'Possible CP Combinations:\n' +
            'AT|DE|ST CP   IV\n';
        const tempStr = '';
        const tempStr2 = '';
        for (let i = 0; i < stats.length; i++) {
            stats[i] = stats[i].map(e => e.toString());
            str += `${stats[i][0].padStart(2)}|${stats[i][1].padStart(2)}|${stats[i][2].padEnd(3)
            }${stats[i][4].padEnd(5)}${Math.round(stats[i][3])}%\n`;
            // tempStr2 = tempStr.padEnd(12) + '(' + stats[i][3] + '%) ';
            // str += tempStr2.padEnd(21) + stats[i][4] + '\n'
        }
    } else {
        str = 'No possible CP combinations found.';
    }

    return str;
}

// Called by `statInfo(pokemon)`: `if (pokemon.cp != 0) {statComboStr = ivComboStr(pokemon); ..}`
function ivComboStr(pokemon) {
    console.time('ivComboStr');

    const ivGuess = (cp) => {
        const stats = [];
        let percent = 0;
        let pkmn = new Pokemon({
            name: pokemon.name,
            level: pokemon.level,
        });

        for (let i = 1; i < 15; i += 1) {
            for (let j = 1; j < 15; j += 1) {
                for (let k = 1; k < 15; k += 1) {
                    percent = ((i + j + k + 3) / 45) * 100;

                    pkmn = pkmn.reCalc({
                        level: pokemon.level,
                        iv: {
                            atk: i + 1,
                            def: j + 1,
                            sta: k + 1,
                        },
                    });

                    if (cp == Math.floor(pkmn.cp)) {
                        stats.push([
                            i + 1,
                            j + 1,
                            k + 1,
                            percent.toFixed(1),
                            pkmn.hp,
                        ]);
                    }
                }
            }
        }

        return stats.sort((a, b) => b[3] - a[3]); // [atk, def, sta, percent, hp]
    };

    const stats = ivGuess(pokemon.cp);
    let str = '';
    if (stats.length > 0) {
        const tempStr = '';
        // Header
        str = `CP = ${pokemon.cp}\n` + 'Possible IV Combinations:\n';
        str += 'AT|DE|ST HP  IV\n';

        // Entries as rows
        for (let i = 0; i < stats.length; i += 1) {
            stats[i] = stats[i].map(e => e.toString());
            str += `${stats[i][0].padStart(2)}|${stats[i][1].padStart(2)}|${stats[i][2].padEnd(2)} ${stats[i][4].padEnd(3)} ${Math.round(stats[i][3])}%\n`;
        }
    } else {
        str = `No possible IV combinations found for CP = ${pokemon.cp}`;
    }
    console.timeEnd('ivComboStr');
    return str;
}

function powerUpCost(startLevel, endLevel) {
    const sd = [];
    const lv = [];
    const c = [];
    const sdCum = [];
    const cCum = [];
    let j = 0;
    const stardust = {};
    const candies = {};

    for (let i = 1; i < 41; i += 0.5) {
        lv.push(i + 0.5);

        if (i < 3) {
            sd.push(200);
            c.push(1);
        } else if (i < 5) {
            sd.push(400);
            c.push(1);
        } else if (i < 7) {
            sd.push(600);
            c.push(1);
        } else if (i < 9) {
            sd.push(800);
            c.push(1);
        } else if (i < 11) {
            sd.push(1000);
            c.push(1);
        } else if (i < 13) {
            sd.push(1300);
            c.push(2);
        } else if (i < 15) {
            sd.push(1600);
            c.push(2);
        } else if (i < 17) {
            sd.push(1900);
            c.push(2);
        } else if (i < 19) {
            sd.push(2200);
            c.push(2);
        } else if (i < 21) {
            sd.push(2500);
            c.push(2);
        } else if (i < 23) {
            sd.push(3000);
            c.push(3);
        } else if (i < 25) {
            sd.push(3500);
            c.push(3);
        } else if (i < 26) {
            sd.push(4000);
            c.push(3);
        } else if (i < 27) {
            sd.push(4000);
            c.push(4);
        } else if (i < 29) {
            sd.push(4500);
            c.push(4);
        } else if (i < 31) {
            sd.push(5000);
            c.push(4);
        } else if (i < 33) {
            sd.push(6000);
            c.push(6);
        } else if (i < 35) {
            sd.push(7000);
            c.push(8);
        } else if (i < 37) {
            sd.push(8000);
            c.push(10);
        } else if (i < 39) {
            sd.push(9000);
            c.push(12);
        } else if (i < 41) {
            sd.push(10000);
            c.push(15);
        }

        if (j === 0) {
            sdCum.push(sd[j]);
            cCum.push(c[j]);
        } else {
            sdCum.push(sdCum[j - 1] + sd[j]);
            cCum.push(cCum[j - 1] + c[j]);
        }
        stardust[lv[j]] = sdCum[j];
        candies[lv[j]] = cCum[j];
        j += 1;
    }
    stardust['1'] = 200;
    candies['1'] = 1;
    return {
        stardust: stardust[endLevel] - stardust[startLevel],
        candies: candies[endLevel] - candies[startLevel],
        cumulative: {
            stardust,
            candies,
        },
    };
}

function getTypeMultipliers(types) {
    //  const types = ['rock', 'ground'];

    const ctx = {};
    const multipliers = {};

    for (const type of types) {
        ctx[type] = db.tc[type];
    }

    for (const type of types) {
        for (const multiplier in ctx[type]) {
            if (ctx[type].hasOwnProperty(multiplier)) {
                if (multipliers.hasOwnProperty(multiplier)) {
                    multipliers[multiplier] += ctx[type][multiplier];
                } else {
                    multipliers[multiplier] = ctx[type][multiplier];
                }
            }
        }
    }

    for (const type in multipliers) {
        switch (multipliers[type]) {
            case -2:
                multipliers[type] = 0.51;
                break;
            case -1:
                multipliers[type] = 0.714;
                break;
            case 1:
                multipliers[type] = 1.4;
                break;
            case 2:
                multipliers[type] = 1.96;
        }
    }

    return multipliers;
}

/**
 * object.compare(arg)
 * Compare object's name or id value if not a String
 * (case insensitive) to argument's name or id value
 * if not a String and return their boolean result
 *
 * @param       arg  Argument object to compare
 * @return      boolean
 * @access      public
 */
Object.prototype.compare = function (arg) {
    try {
        if (typeof (arg) === 'string') {
            if (typeof (this.valueOf()) === 'string') {
                return this.valueOf().toLowerCase() === arg.toLowerCase();
            }
            if (this.hasOwnProperty('name')) {
                return this.name.toLowerCase() === arg.toLowerCase();
            } throw 'Object.name is undefined';
        } else {
            if (this.hasOwnProperty('id') && arg.hasOwnProperty('id')) {
                return this.id === arg.id;
            }
            if (!this.hasOwnProperty('id')) throw 'Object.id is undefined';
            if (!arg.hasOwnProperty('id')) throw 'Argument.id is undefined';
        }
    } catch (e) {
    // console.log(e);
        throw e;
    }
};

module.exports = {
    isPokemonName,
    isMoveName,
    Pokemon,
    Move,
    pokemonInfo,
    moveInfo,
    statInfo,
    statInfo2,
    clean,
    powerUpCost,
    getTypeMultipliers,
};
