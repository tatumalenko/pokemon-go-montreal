const DU = require('./dictutils');
const dictutils = new DU.DictUtils();

var NorvigSpellChecker = function () {
    var that = {},
        filter = /([a-z]+)/g,
        alphabets = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        NWORDS = {}; //Training Model

    var train = function (trainingText) {
        var features = trainingText.match(filter);
        for (var f in features) {
            var feature = features[f];
            if (NWORDS.hasOwnProperty(feature)) {
                NWORDS[feature] += 1;
            } else {
                NWORDS[feature] = 1;
            }
        }
    };

    var edits1 = function (words) {
        var edits1Set = [];
        for (var w = 0; w < words.length; w++) {
            var word = words[w];
            for (var i = 0; i <= word.length; i++) {
                //splits (a & b)
                var a = word.slice(0, i),
                    b = word.slice(i),
                    c = b.slice(1),
                    d = b.slice(2);
                if (b != '') {
                    //deletes
                    edits1Set.push(a + c);
                    //transposes
                    if (b.length > 1) {
                        edits1Set.push(a + b.charAt(1) + b.charAt(0) + d);
                    }
                    //replaces & inserts
                    for (var j = 0; j < alphabets.length; j++) {
                        edits1Set.push(a + alphabets[j] + c); //replaces
                        edits1Set.push(a + alphabets[j] + b); //inserts
                    }
                } else {
                    //inserts (remaining set for b == '')
                    for (var j = 0; j < alphabets.length; j++) {
                        edits1Set.push(a + alphabets[j] + b);
                    }
                }
            }
        }
        return edits1Set;
    };

    var edits2 = function (words) {
        return edits1(edits1(words));
    };

    Object.prototype.isEmpty = function () {
        var that = this;
        for (var prop in that) {
            if (that.hasOwnProperty(prop))
                return false;
        }
        return true;
    };

    Function.prototype.curry = function () {
        var slice = Array.prototype.slice,
            args = slice.apply(arguments),
            that = this;
        return function () {
            return that.apply(null, args.concat(slice.apply(arguments)));
        };
    };

    var known = function () {
        var knownSet = {};
        for (var i = 0; knownSet.isEmpty() && i < arguments.length; i++) {
            var words = arguments[i];
            for (var j = 0; j < words.length; j++) {
                var word = words[j];
                if (!knownSet.hasOwnProperty(word) && NWORDS.hasOwnProperty(word)) {
                    knownSet[word] = NWORDS[word];
                }
            }
        }
        return knownSet;
    };

    var max = function (candidates) {
        var maxCandidateKey = null,
            maxCandidateVal = 0,
            currentCandidateVal;
        for (var candidate in candidates) {
            currentCandidateVal = candidates[candidate];
            if (candidates.hasOwnProperty(candidate) && currentCandidateVal > maxCandidateVal) {
                maxCandidateKey = candidate;
                maxCandidateVal = currentCandidateVal;
            }
        }
        return maxCandidateKey;
    };

    var correct = function () {
        var corrections = {};
        for (var i = 0; i < arguments.length; i++) {
            var word = arguments[i];
            var candidates = known.curry()([word], edits1([word]), edits2([word]));
            corrections[word] = candidates.isEmpty() ? word : max(candidates);
        }
        return corrections;
    };

    that.train = train;
    that.correct = correct.curry();

    return that;
};

const speller = NorvigSpellChecker();

speller.train(dictutils.getPokemonNamesArray().join(' '));
console.log(speller.correct('chameton'));