const configs = require('../../configs/configs.js');
const NeighbourhoodRepository = require('../repositories/NeighbourhoodRepository');

class Location {
    constructor({ coordinates: { latitude, longitude }, address }) {
        const neighbourhoodRepository = new NeighbourhoodRepository(configs.polygonMapPath);
        this.coordinates = { latitude, longitude };
        this.address = address;
        this.neighbourhood = neighbourhoodRepository.findNeighbourhood(this.coordinates);
        this.gmapsUrl = this.createGmapsUrl();
    }

    createGmapsUrl() {
        return `https://maps.google.com/maps?q=${this.coordinates.latitude},${this.coordinates.longitude}`;
    }
}

module.exports = Location;
