// Import the togeojson and fs module
let tj = require('togeojson'),
    fs = require('fs'),
    DOMParser = require('xmldom').DOMParser;

// Import the turf module
let turf = require('turf');

const didYouMean = require('didyoumean');
didYouMean.threshold = 1000;

//let pkmndict = require('./pkmn.json');
//let nbhdict = require('./neighbourhoods.json');

//----------------------------------------------------------------------------------------------
// Convert the *.kml file containing polygons into geojson format
//----------------------------------------------------------------------------------------------
let kml = new DOMParser().parseFromString(fs.readFileSync('neighbourhoods.kml', 'utf8'));
let polygonCollection = tj.kml(kml);
let polygons = [];
for (let i = 0; i < polygonCollection.features.length; i++) {
    polygons[i] = polygonCollection.features[i];
}
for (var i = 0; i < polygons.length; i++) { // i: number of neighbourhood polygons
    for (var j = 0; j < polygons[i].geometry.coordinates[0].length; j++) { // j: number of gps triples within polygon
        polygons[i].geometry.coordinates[0][j].pop(); // Take out altitute coordinate {z: 0}
        polygons[i].geometry.coordinates[0][j].reverse(); // Flip (lng,lat) into (lat,lng) pairs
    }
}


let point = {
    'type': 'Feature',
    'properties': {
        'marker-color': '#f00'
    },
    'geometry': {
        'type': 'Point',
        'coordinates': [45.71673041, -73.49633457]
    }
};

let insideNeighbourhood;
for (let i = 0; i < polygons.length; i++) {

    if (turf.inside(point, polygons[i])) {
        insideNeighbourhood = polygons[i].properties.name;
    }
}

if (insideNeighbourhood) {
    console.log('Coordinates found in neighbourhood: ' + insideNeighbourhood);
} else {
    console.log('Coordinates not found in any of the polygons!\n');
}