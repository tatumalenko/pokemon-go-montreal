module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'gyms',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            const gyms = await this.client.gymRepository.fetchAllGyms();
            let message = '';

            // Compiling gyms by neigbourhood.
            const gymsByNeigborhood = {};
            const noNeighbourhoodGyms = [];
            let nbNeighbourhood = 0;
            gyms.forEach((element) => {
                if (element.neighbourhood === '' || element.neighbourhood === undefined) {
                    noNeighbourhoodGyms.push(element);
                } else {
                    if (gymsByNeigborhood[`${element.neighbourhood}`] == null) {
                        gymsByNeigborhood[`${element.neighbourhood}`] = [];
                        nbNeighbourhood += 1;
                    }

                    gymsByNeigborhood[`${element.neighbourhood}`].push(element);
                }
            });

            // Preparing message to print.
            message += `${gyms.length} gyms in ${nbNeighbourhood} neigbourhoods.\n`;
            message += `${noNeighbourhoodGyms.length} gyms in NO neigbourhood!\n`;
            await Object.keys(gymsByNeigborhood).forEach((key) => {
                const val = gymsByNeigborhood[key];
                message += `${val.length} gyms in '${key}'\n`;
            });

            await msg.channel.send(message);
        } catch (e) {
            await msg.channel.send(e.message);
            console.log(e);
        }
    }
};
