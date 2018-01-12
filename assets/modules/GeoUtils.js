const tj = require('togeojson');
const fs = require('fs');
const { DOMParser } = require('xmldom');
const turf = require('turf');

const KML_FILE_NAME = 'neighbourhoods2.kml';

class GeoUtils {
    constructor() {

    }

    createPoint({
        lat,
        lon,
    }) {
        return {
            type: 'Feature',
            properties: {
                'marker-color': '#f00',
            },
            geometry: {
                type: 'Point',
                coordinates: [lat, lon],
            },
        };
    }

    /* USED IN pikachu-bot2.js */
    findPointInPolygon({
        lat,
        lon,
    }) {
        try {
            let hasFoundPoint;
            let spawnNeighbourhood;

            const point = this.createPoint({
                lat,
                lon,
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
                { return spawnNeighbourhood; }
            return false;
        } catch (err) {
            console.log(err.stack);
        }
        
    }

    getNeighbourhoodPolygonCoordsArray() {
        let kml;

        // Depending on where I use this module, the pwd of execution might be relatively at different spots
        try {
            kml = new DOMParser().parseFromString(fs.readFileSync(KML_FILE_NAME, 'utf8'));
        } catch (e) {
            try {
                kml = new DOMParser().parseFromString(fs.readFileSync(`../assets/data/${KML_FILE_NAME}`, 'utf8'));
            } catch (err) {
                kml = new DOMParser().parseFromString(fs.readFileSync(`../data/${KML_FILE_NAME}`, 'utf8'));
            }
        }

        const polygonCollection = tj.kml(kml);
        const polygons = [];

        for (let i = 0; i < polygonCollection.features.length; i++) {
            polygons[i] = polygonCollection.features[i];
        }

        for (let i = 0; i < polygons.length; i++) { // i: number of neighbourhood polygons
            for (let j = 0; j < polygons[i].geometry.coordinates[0].length; j++) { // j: number of gps triples within polygon
                polygons[i].geometry.coordinates[0][j].pop(); // Take out altitute coordinate {z: 0}
                polygons[i].geometry.coordinates[0][j].reverse(); // Flip (lng,lat) into (lat,lng) pairs
            }
        }

        return polygons;
    }
}

module.exports = GeoUtils;
