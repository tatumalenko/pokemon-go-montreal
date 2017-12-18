const turf = require("turf");
const toGeoJson = require("togeojson");
const DOMParser = require('xmldom').DOMParser;
const fs = require("fs");

class Neighborhood {
    constructor(mapLocation) {
        this.MapLocation = mapLocation;
        var kml = new DOMParser().parseFromString(fs.readFileSync(this.MapLocation, 'utf8'));
        this.polygons = toGeoJson.kml(kml).features;

        this.polygons.forEach(function(item) {
            item.geometry.coordinates[0].forEach(function(coord){
                coord.pop(); // remove altitude.
                coord.reverse(); // Coords are reversed (long, lat)...
            });
        });
    }

    GetNeighborhood(lat, long) {
        var point = {type:'Feature', geometry:{type:'Point', coordinates:[lat, long]}};
        var neighborhood = "";

        for (var i = 0; i < this.polygons.length; i++) {
            if (turf.inside(point, this.polygons[i])) {
                return this.polygons[i].properties.name;
            }
        }
    }
}

module.exports = Neighborhood;