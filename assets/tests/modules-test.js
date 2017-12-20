// Import botutils module
const bu = require('../modules/botutils3');
const du = require('../modules/dbutils3');

const getNeighbourhoodSynonymTest = () => {
    const filters = [
        'pat',
        'downtown',
        'gyarados'
    ];

    const synonyms = [];
    for (let filter of filters) {
        synonyms.push(du.getNeighbourhoodSynonym(filter));
    }

    console.log(synonyms);
    return synonyms;
}

const findPointInPolygonTest = async() => {
    const coordinates = [
        [45.57776, -73.52497], //base-militaire1
        [45.57836, -73.53166], //base-militaire2
        [45.58377, -73.54608], //longue-pointe1
        [45.57701, -73.52934], //longue-pointe2
        [45.5619, -73.56582], //jardin-botanique
        [45.55432, -73.5823], //rosemont
    ];

    const spawnNeighbourhoods = [];
    for (let coordinatePair of coordinates) {
        //console.log(coordinatePair);
        spawnNeighbourhoods.push(await bu.findPointInPolygon(coordinatePair));
    }

    console.log(spawnNeighbourhoods);
    return spawnNeighbourhoods;
}

//findPointInPolygonTest();
getNeighbourhoodSynonymTest();