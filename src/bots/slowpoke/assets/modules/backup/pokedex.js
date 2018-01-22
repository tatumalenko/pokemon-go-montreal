module.exports = {
    CPMl: CPMl,
    search: search,
    info: info,
    CP: CP,
    MAXCP: MAXCP,
    embed: embed
}

function CPMl(level) {
    var CPM = function (level) {
        var a = [0.094, 0.16639787, 0.21573247, 0.25572005, 0.29024988, 0.3210876, 0.34921268, 0.3752356, 0.39956728, 0.4225, 0.44310755, 0.4627984, 0.48168495, 0.49985844, 0.51739395, 0.5343543, 0.5507927, 0.5667545, 0.5822789, 0.5974, 0.6121573, 0.6265671, 0.64065295, 0.65443563, 0.667934, 0.6811649, 0.69414365, 0.7068842, 0.7193991, 0.7317, 0.7377695, 0.74378943, 0.74976104, 0.7556855, 0.76156384, 0.76739717, 0.7731865, 0.77893275, 0.784637, 0.7903];
        return a[level - 1];
    }

    if (level % 1 !== 0) {
        return (CPM(level - 0.5) ** 2 + (CPM(level + 0.5) ** 2 - CPM(level - 0.5) ** 2) / 2) ** 0.5;
    } else return CPM(level);
};

function search(source, key, value) {
    return pokemon = source.filter(function (el) {
        if (el[key].toLowerCase().replace(/ fast/g,'')  === value.toLowerCase()) {
            return el;
        }
    })[0];;
};

function info(name) {
    var db = require('./pokemon.json');
    return search(db,"name",name);
}

function CP(pokemon) {
    return (1 / 10 
        * (pokemon["stats"]["baseAttack"] + pokemon["iv"]["attack"]) 
        * (pokemon["stats"]["baseDefense"] + pokemon["iv"]["defense"]) ** 0.5
        * (pokemon["stats"]["baseStamina"] + pokemon["iv"]["stamina"]) ** 0.5
        * CPMl(pokemon["level"]) ** 2
    ).toFixed(2);
};

function guessLevel(pokemon) {
    const cpm = (10
        * pokemon.cp
        / (pokemon.stats.effectiveAttack * pokemon.stats.effectiveDefense**0.5 * pokemon.stats.effectiveStamina**0.5)
    ) ** 0.5

    let cpmGuess = 0, level = 0;
    for (let i = 0; i < 40; i++) {
        let cpmTemp = CPMl(i + 1);
        if (Math.abs(cpm - cpmTemp)/cpm < Math.abs(cpm - cpmGuess)/cpm) {
            cpmGuess = cpmTemp; 
            level = i + 1;
        }
    }

    return level;
}

function MAXCP(name) {
    var db = require('./pokemon.json');

    return CP(Object.assign(search(db, "name", name), {
        "iv": {
            "attack": 15,
            "defense": 15,
            "stamina": 15
        },
        "level": 39
    }));
};

function effectiveStats(pokemon) {
    const eATK = (pokemon["stats"]["baseAttack"] + pokemon["iv"]["attack"])*CPMl(pokemon["level"]);
    const eDEF = (pokemon["stats"]["baseDefense"] + pokemon["iv"]["defense"])*CPMl(pokemon["level"]);
    const eSTA = (pokemon["stats"]["baseStamina"] + pokemon["iv"]["stamina"])*CPMl(pokemon["level"]);
    const HP   = Math.floor(eSTA);

    pokemon["stats"]["effectiveAttack"] = eATK;
    pokemon["stats"]["effectiveDefense"] = eDEF;
    pokemon["stats"]["effectiveStamina"] = eSTA;
    pokemon["stats"]["hp"] = HP;

    return pokemon;
}

function calcDamage(attacker,defenderType) {
    const typeMatrixNames = ["normal","fighting","flying","poison","ground","rock","bug","ghost","steel","fire","water","grass","electric","psychic","ice","dragon","dark","fairy"];
    const typeMatrix = [[1,	1,	1,	1,	1,	0.714,	1,	0.51,	0.714,	1,	1,	1,	1,	1,	1,	1,	1,	1],
                        [1.4,	1,	0.714,	0.714,	1,	1.4,	0.714,	0.51,	1.4,	1,	1,	1,	1,	0.714,	1.4,	1,	1.4,	0.714],
                        [1,	1.4,	1,	1,	1,	0.714,	1.4,	1,	0.714,	1,	1,	1.4,	0.714,	1,	1,	1,	1,	1],
                        [1,	1,	1,	0.714,	0.714,	0.714,	1,	0.714,	0.51,	1,	1,	1.4,	1,	1,	1,	1,	1,	1.4],
                        [1,	1,	0.51,	1.4,	1,	1.4,	0.714,	1,	1.4,	1.4,	1,	0.714,	1.4,	1,	1,	1,	1,	1],
                        [1,	0.714,	1.4,	1,	0.714,	1,	1.4,	1,	0.714,	1.4,	1,	1,	1,	1,	1.4,	1,	1,	1],
                        [1,	0.714,	0.714,	0.714,	1,	1,	1,	0.714,	0.714,	0.714,	1,	1.4,	1,	1.4,	1,	1,	1.4,	0.714],
                        [0.51,	1,	1,	1,	1,	1,	1,	1.4,	1,	1,	1,	1,	1,	1.4,	1,	1,	0.714,	1],
                        [1,	1,	1,	1,	1,	1.4,	1,	1,	0.714,	0.714,	0.714,	1,	0.714,	1,	1.4,	1,	1,	1.4],
                        [1,	1,	1,	1,	1,	0.714,	1.4,	1,	1.4,	0.714,	0.714,	1.4,	1,	1,	1.4,	0.714,	1,	1],
                        [1,	1,	1,	1,	1.4,	1.4,	1,	1,	1,	1.4,	0.714,	0.714,	1,	1,	1,	0.714,	1,	1],
                        [1,	1,	0.714,	0.714,	1.4,	1.4,	0.714,	1,	0.714,	0.714,	1.4,	0.714,	1,	1,	1,	0.714,	1,	1],
                        [1,	1,	1.4,	1,	0.51,	1,	1,	1,	1,	1,	1.4,	0.714,	0.714,	1,	1,	0.714,	1,	1],
                        [1,	1.4,	1,	1.4,	1,	1,	1,	1,	0.714,	1,	1,	1,	1,	0.714,	1,	1,	0.51,	1],
                        [1,	1,	1.4,	1,	1.4,	1,	1,	1,	0.714,	0.714,	0.714,	1.4,	1,	1,	0.714,	1.4,	1,	1],
                        [1,	1,	1,	1,	1,	1,	1,	1,	0.714,	1,	1,	1,	1,	1,	1,	1.4,	1,	0.51],
                        [1,	0.714,	1,	1,	1,	1,	1,	1.4,	1,	1,	1,	1,	1,	1.4,	1,	1,	0.714,	0.714],
                        [1,	1.4,	1,	0.714,	1,	1,	1,	1,	0.714,	0.714,	1,	1,	1,	1,	1,	1.4,	1.4,	1]];
    const dbMove = require('./move.json');
    
    Object.assign(attacker, {
        "iv": {
            "attack": 15,
            "defense": 15,
            "stamina": 15
        },
        "level": 39
    });

    attacker = effectiveStats(attacker);

    //maybe replace "cinematicMoves" with Moves var to be either "cinematicMoves" and "quickMoves"
    for(let i = 0; i < attacker["cinematicMoves"].length; i++) {
        let move = search(dbMove,"name",attacker["cinematicMoves"][i]["name"]);
        
        let stab = 1;
        for(let j = 0; j < attacker["types"].length; j++) {
            if(attacker["types"][j]["name"] === move["pokemonType"]["name"]) {
                stab = 1.2;
                break;
            }
        }

        attacker.stats.stab = stab;

        let eff  = 1;
        //figure out how to implement eff matrix multiplier

        attacker["cinematicMoves"][i]["power"] = move["power"];
        attacker["cinematicMoves"][i]["durationMs"] = move["durationMs"];
        // attacker["cinematicMoves"][i]["damage"] = Math.floor(
        //                                             0.5*attacker["cinematicMoves"][i]["power"]
        //                                             *attacker["stats"]["effectiveAttack"]
        //                                             /178.5348
        //                                             *stab*eff) + 1;
        attacker["cinematicMoves"][i]["damage"] = Math.floor(
                                                    0.5*attacker["cinematicMoves"][i]["power"]
                                                    *attacker["stats"]["effectiveAttack"]
                                                    /100
                                                    *stab*eff) + 1;
        attacker["cinematicMoves"][i]["dps"] = 1000*attacker["cinematicMoves"][i]["damage"]/attacker["cinematicMoves"][i]["durationMs"]*attacker.stats.stab;
    }

    for(let i = 0; i < attacker["quickMoves"].length; i++) {
        let move = search(dbMove,"name",attacker["quickMoves"][i]["name"].replace(/ Fast/g,''));

        //console.log(attacker["quickMoves"][i]);

        let stab = 1;
        for(let j = 0; j < attacker["types"].length; j++) {
            if(attacker["types"][j]["name"] === move["pokemonType"]["name"]) {
                stab = 1.2;
                break;
            }
        }
        attacker.stats.stab = stab;
        
        let eff  = 1;
        //figure out how to implement eff matrix multiplier

        attacker["quickMoves"][i]["power"] = move["power"];
        attacker["quickMoves"][i]["durationMs"] = move["durationMs"];
        // attacker["quickMoves"][i]["damage"] = Math.floor(
        //                                             0.5*attacker["quickMoves"][i]["power"]
        //                                             *attacker["stats"]["effectiveAttack"]
        //                                             /178.5348
        //                                             *stab*eff) + 1;
        attacker["quickMoves"][i]["damage"] = Math.floor(
                                                    0.5*attacker["quickMoves"][i]["power"]
                                                    *attacker["stats"]["effectiveAttack"]
                                                    /100
                                                    *stab*eff) + 1;
        attacker["quickMoves"][i]["dps"] = 1000*attacker["quickMoves"][i]["damage"]/attacker["quickMoves"][i]["durationMs"]*attacker.stats.stab;
    }

    return attacker;
}

function hex2dec(hex) {
    return parseInt(hex,16).toString(10);
}    

function embed(args) {
    let cp, name, pokemon, move;
    const db = require('./pokemon.json');
    const dbMove = require('./move.json');
    if (isFinite(parseInt(args.split(' ').pop()))) {
        cp = parseInt(args.split(' ').pop());
        name = args.split(' ').splice(0,args.split(' ').length - 1).join(' ');
        pokemon = search(db,"name",name);
        move = search(dbMove,"name",name);
        console.log(name);
    } else {
        name = args;
        pokemon = search(db,"name",name);
        move = search(dbMove,"name",name);
    }
    //console.log(move !== undefined);

    const typecolor = {
        bug: "A8B820", 
        dark: "705848",
        electric: "F8D030",
        fairy: "EE99AC",
        flying: "A890F0",
        fighting: "C03028",
        fire: "F08030",
        ghost: "705898",
        grass: "78C850",
        ground: "E0C068",
        ice: "98D8D8",
        normal: "A8A878",
        poison: "A040A0",
        psychic: "F85888",
        rock: "B8A038",
        steel: "B8B8D0",
        water: "6390F0"
    }

    const typeCode = {
        bug: "<:bug1:356615716298031105>", 
        dark: "<:dark:356615715182084096>",
        electric: "<:electric:356615714989146113>",
        fairy: "<:fairy:356615715228221450>",
        flying: "<:flying:356615715324952576>",
        fighting: "<:fighting:356615716750753793>",
        fire: "<:fire1:356615716528586753>",
        ghost: "<:ghost1:356615716084121611>",
        grass: "<:grass:356615716482449408>",
        ground: "<:ground:356615716285186049>",
        ice: "<:ice:356615717090492436>",
        normal: "<:normal:356615717090492417>",
        poison: "<:poison:356615716784439303>",
        psychic: "<:psychic:356615716402757645>",
        rock: "<:rock:356615716428054538>",
        steel: "<:steel:356615716968857601>",
        water: "<:water:356615716905943040>"
    }

    if (cp) {
        let stats = [];
        pokemon.level = 20;
        pokemon.cp = function(a,d,s) {
            return 1/10*(pokemon.stats.baseAttack+a)*(pokemon.stats.baseDefense+d)**0.5*(pokemon.stats.baseStamina+s)**0.5*CPMl(pokemon.level)**2;
        }

        pokemon.iv = function(cp) {
            let stats = [];
            let percent = 0;
            for (let i = 1; i < 15; i++) {
                for (let j = 1; j < 15; j++) {
                    for (let k = 1; k < 15; k++) {
                        percent = (i+j+k+3)/45*100;
                        //console.log(i+1,j+1,k+1,parseFloat(percent.toFixed(1)));
                        if (cp === Math.floor(this.cp(i+1,j+1,k+1))) {
                            stats.push([i+1, j+1, k+1, percent.toFixed(1)]);
                            //console.log(i+1,j+1,k+1,percent);
                        }
                    }
                }
            }
            return stats;
        }

        var typeStr = "";
        if(pokemon["types"].length > 1) {
            typeStr = typeCode[pokemon["types"][0]["name"].toLowerCase()] + " " + pokemon["types"][0]["name"] + " | " + typeCode[pokemon["types"][1]["name"].toLowerCase()] + " " + pokemon["types"][1]["name"];
        } else {
            typeStr = typeCode[pokemon["types"][0]["name"].toLowerCase()] + " " + pokemon["types"][0]["name"];
        }

        stats = pokemon.iv(cp);

        let ivComboStr = '';
        if (stats.length > 0) {
            ivComboStr = 'CP = ' + cp + '\n' + 'Possible IV Combinations:\n' 
                         + 'atk/def/sta ' + '(IV%)\n'.padding(6);
            let tempStr = '';
            for (let i = 0; i < stats.length; i++) {
                tempStr = stats[i][0] + '/' + stats[i][1] + '/' + stats[i][2];
                ivComboStr += tempStr.padding(12) + '(' + stats[i][3] + '%)\n';
            }
        } else {
            ivComboStr = 'No possible IV combinations found for CP = ' + cp;
        }

        const embed = {
            "title": "#" + pokemon["dex"] + " " + pokemon["name"] + " - MaxCP: " + Math.round(MAXCP(pokemon["name"])),
            "url": "https://db.pokemongohub.net/pokemon/" + pokemon["dex"],
            "description": "**Type**: " + typeStr + "\n"
                            + '`' + ivComboStr + '`',
            "color": hex2dec(typecolor[pokemon["types"][0]["name"].toLowerCase()]),
            "thumbnail": {
                "url": "https://pkmref.com/images/set_1/" + pokemon["dex"] + ".png"
            }
        };

        return embed;
    } else if (pokemon !== undefined) {
        var pokemon2 = calcDamage(pokemon,"normal");

        var typeStr = "";
        if(pokemon["types"].length > 1) {
            typeStr = typeCode[pokemon["types"][0]["name"].toLowerCase()] + " " + pokemon["types"][0]["name"] + " | " + typeCode[pokemon["types"][1]["name"].toLowerCase()] + " " + pokemon["types"][1]["name"];
        } else {
            typeStr = typeCode[pokemon["types"][0]["name"].toLowerCase()] + " " + pokemon["types"][0]["name"];
        }

        var quickMovesStr = "";
        for(var i = 0; i < pokemon["quickMoves"].length; i++){
            if(i !== 0) {
                quickMovesStr = quickMovesStr + " \n";
            }

            quickMovesStr = quickMovesStr + pokemon["quickMoves"][i]["name"].replace(/ Fast/g,'') + " `(DPS: " + pokemon2["quickMoves"][i]["dps"].toFixed(2) + ")`";
        }

        var chargeMovesStr = "";
        for(var i = 0; i < pokemon["cinematicMoves"].length; i++){
            if(i !== 0) {
                chargeMovesStr = chargeMovesStr + " \n";
            }

            chargeMovesStr = chargeMovesStr + pokemon["cinematicMoves"][i]["name"] + " `(DPS: " + pokemon2["cinematicMoves"][i]["dps"].toFixed(2) + ")`";
        }

        const embed = {
            "title": "#" + pokemon["dex"] + " " + pokemon["name"] + " - MaxCP: " + Math.round(MAXCP(pokemon["name"])),
            "url": "https://db.pokemongohub.net/pokemon/" + pokemon["dex"],
            "description": "**Type**: " + typeStr + "\n`" 
                            + pokemon["stats"]["baseAttack"] + " atk / " + pokemon["stats"]["baseDefense"] + " def / " + pokemon["stats"]["baseStamina"] + " sta` \n\n" 
                            + "**Fast Moves**: \n" + quickMovesStr + "\n\n" 
                            + "**Charge Moves**: \n" + chargeMovesStr + "\n\n", 
                            //+ "**Evolution**: \n Evolve1 » Evolve2 » Evolve3",
            "color": hex2dec(typecolor[pokemon["types"][0]["name"].toLowerCase()]),
            "thumbnail": {
                "url": "https://pkmref.com/images/set_1/" + pokemon["dex"] + ".png"
            }
        };
        //console.log(typecolor[pokemon["types"][0]["name"]]);
        
        return embed;
    } else if(move !== undefined) {
        let moveFastOrCharge = "";
        //console.log(move);
        if(move["name"].search(/ Fast/g) > 0) {
            moveFastOrCharge = "Fast";
        } else {
            moveFastOrCharge = "Charge";
        };

        const embed = {
            "title": move["name"].replace(/ Fast/g,""),
            "url": "https://db.pokemongohub.net/moves/" + move["pokemonType"]["name"].toLowerCase(),
            "description": "**" + moveFastOrCharge + " Move**\n"
                         + "**Type**: " + typeCode[move["pokemonType"]["name"].toLowerCase()] + move["pokemonType"]["name"] + "\n"
                         + "**Power**: " + "`" + move["power"] + "`\n"
                         + "**Duration** (sec): " + "`" + 1/1000*move["durationMs"] + "`\n"
                         + "**Approx. DPS**: " + "`" + (1000*move["power"]/move["durationMs"]).toFixed(2) + "`\n",               
            "color": hex2dec(typecolor[move["pokemonType"]["name"].toLowerCase()])
        };

        return embed;
    } else {
        return undefined;
    }
};

/**
 * object.padding(number, string)
 * Transform the string object to string of the actual width filling by the padding character (by default ' ')
 * Negative value of width means left padding, and positive value means right one
 *
 * @param       number  Width of string
 * @param       string  Padding character (by default, ' ')
 * @return      string
 * @access      public
 */
String.prototype.padding = function(n, c)
{
        var val = this.valueOf();
        if ( Math.abs(n) <= val.length ) {
                return val;
        }
        var m = Math.max((Math.abs(n) - this.length) || 0, 0);
        var pad = Array(m + 1).join(String(c || ' ').charAt(0));
//      var pad = String(c || ' ').charAt(0).repeat(Math.abs(n) - this.length);
        return (n < 0) ? pad + val : val + pad;
//      return (n < 0) ? val + pad : pad + val;
};