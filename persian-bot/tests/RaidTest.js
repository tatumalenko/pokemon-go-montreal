/**
 * To run this file, just execute: `node test/RaidTest.js`
 */
const Raid = require("../persian/Raid.js");

var testCases = [
    `**Egg** - Level: 5
    
    **Start**: 11:04:39AM
    **End**: 01:49:39PM
    
    **Address**: 6300-6398 Avenue de Darlington
    **Map**: <https://montrealpokemap.com/gym.html#45.508669,-73.628521>
    **Google Map**: <https://maps.google.com/maps?q=45.508669,-73.628521>
    <@&358248673479491586>`
    ,
    `[Pointe-Saint-Charles] **Nidoqueen** - Level: 4 - CP: 23216
    
    **Moveset**: Bite - Stone Edge
    
    **Start**: 05:06:43PM
    **End**: 05:51:43PM
    
    **Current Team**: Instinct
    
    **Address**: 625 Rue Fortune
    **Map**: <https://montrealpokemap.com/gym.html#45.478171,-73.559161>
    **Google Map**: <https://maps.google.com/maps?q=45.478171,-73.559161>
    <@&358248673479491586>`
    ,
    `**Golem** - Level: 4 - CP: 30572
    
    **Moveset**: Rock Throw - Stone Edge
    
    **Start**: 05:05:54PM
    **End**: 11:56:54PM
    
    **Current Team**: Mystic
    
    **Address**: 2 Avenue Sainte-Anne
    **Map**: <https://montrealpokemap.com/gym.html#45.426638,-73.825086>
    **Google Map**: <https://maps.google.com/maps?q=45.426638,-73.825086>
    <@&358248673479491586>`
    ,
    `[Laurier-Est] **Egg** - Level: 5
    
    **Start**: 06:13:08PM
    **End**: 06:58:08PM
    
    **Address**: 1564 Avenue Laurier E
    **Map**: <https://montrealpokemap.com/gym.html#45.534829,-73.58244>
    **Google Map**: <https://maps.google.com/maps?q=45.534829,-73.58244>
    <@&358248673479491586>
    `,
    `[Golden Square Mile] **Nidoqueen** - Level: 4 - CP: 23216
    
    **Moveset**: Poison Jab - Stone Edge
    
    **Start**: 05:15:05PM
    **End**: 06:00:05PM
    
    **Current Team**: Mystic
    
    **Address**: 45.500925, -73.575052
    **Map**: <https://montrealpokemap.com/gym.html#45.500925,-73.575052>
    **Google Map**: <https://maps.google.com/maps?q=45.500925,-73.575052>
    <@&358248673479491586>
    `,
    `[Downtown] **Egg** - Level: 5
    
    **Start**: 06:08:50PM
    **End**: 06:53:50PM
    
    **Address**:  Autoroute 720
    **Map**: <https://montrealpokemap.com/gym.html#45.502011,-73.56281>
    **Google Map**: <https://maps.google.com/maps?q=45.502011,-73.56281>
    <@&358248673479491586>`,
];

testCases.forEach(function(element) {
    var raid = new Raid(element);
    console.log(raid.GetDescription());
});
