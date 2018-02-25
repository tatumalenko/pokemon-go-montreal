const fs = require('fs');
const tj = require('togeojson');
const { DOMParser } = require('xmldom');
const turf = require('turf');

class NeighbourhoodRepository {
    constructor(kmlFilePath) {
        this.kmlFilePath = kmlFilePath;
        this.polygons = getPolygonsFromKml(kmlFilePath);
        this.neighbourhoods = this.polygons.map(p => p.properties.name);
    }

    findNeighbourhood({ latitude, longitude }) {
        let spawnNeighbourhood;

        try {
            const point = {
                type: 'Feature',
                properties: {
                    'marker-color': '#f00',
                },
                geometry: {
                    type: 'Point',
                    coordinates: [latitude, longitude],
                },
            };

            for (let i = 0; i < this.polygons.length; i += 1) {
                if (turf.inside(point, this.polygons[i])) {
                    spawnNeighbourhood = this.polygons[i].properties.name;
                    break;
                } else {
                    spawnNeighbourhood = '';
                }
            }
        } catch (err) {
            console.log(err);
        }

        return spawnNeighbourhood;
    }
}

module.exports = NeighbourhoodRepository;

function getPolygonsFromKml(kmlFilePath) {
    try {
        const kml = new DOMParser().parseFromString(fs.readFileSync(kmlFilePath, 'utf8'));


        const polygonCollection = tj.kml(kml);
        const polygons = polygonCollection.features;

        polygons.forEach((polygon) => {
            polygon.geometry.coordinates[0].forEach((coordTriple) => {
                coordTriple.pop(); // Take out altitute coordinate {z: 0}
                coordTriple.reverse(); // Flip (lng,lat) into (lat,lng) pairs
            });
        });

        return polygons;
    } catch (err) {
        console.log(err);
    }
}

// const nr = new NeighbourhoodRepository({});
// console.log(nr.findNeighbourhood({ latitude: 45.519082, longitude: -73.564672 }));

