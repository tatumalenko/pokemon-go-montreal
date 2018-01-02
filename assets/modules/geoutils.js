const tj = require('togeojson'),
    fs = require('fs'),
    DOMParser = require('xmldom').DOMParser;

const turf = require('turf');

class GeoUtils {
    constructor() {

    }

    createPoint({
        lat,
        lon
    }) {
        return {
            'type': 'Feature',
            'properties': {
                'marker-color': '#f00'
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [lat, lon]
            }
        };
    }

    /* USED IN pikachu-bot2.js */
    findPointInPolygon({
        lat,
        lon
    }) {
        try {
            let hasFoundPoint, spawnNeighbourhood;

            const point = this.createPoint({
                lat,
                lon
            });
            const polygons = this.getNeighbourhoodPolygonCoordsArray();

            for (let i = 0; i < polygons.length; i++) {
                if (turf.inside(point, polygons[i])) {
                    spawnNeighbourhood = polygons[i].properties.name;

                    hasFoundPoint = true;
                    break;
                } else {
                    hasFoundPoint = false;
                }
            }

            if (hasFoundPoint)
                return spawnNeighbourhood;
            else
                return false;

        } catch (err) {
            console.log(err.stack);
        }
    }

    getNeighbourhoodPolygonCoordsArray() {
        let kml;
        try {
            kml = new DOMParser().parseFromString(fs.readFileSync('neighbourhoods2.kml', 'utf8'));
        } catch (e) {
            try {
                kml = new DOMParser().parseFromString(fs.readFileSync('../assets/data/neighbourhoods2.kml', 'utf8'));
            } catch (err) {
                kml = new DOMParser().parseFromString(fs.readFileSync('../data/neighbourhoods2.kml', 'utf8'));
            }
        }

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

        return polygons;
    }
}

module.exports = {
    GeoUtils
};