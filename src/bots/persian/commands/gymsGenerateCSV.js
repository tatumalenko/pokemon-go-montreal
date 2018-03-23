const fs = require('fs');

module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'gyms',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: [],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            if (!args.includes('csv')) {
                return;
            }

            const gyms = await this.client.gymRepository.fetchAllGyms();

            // Building CSV structure
            let csv = 'Gym Name,Latitude,Longitude\n';
            gyms.forEach((element) => {
                const name = element.name.replace(',', ' ');
                csv += `${name},${element.latitude},${element.longitude}\n`;
            });

            // Output the file
            // TODO: Configure output path
            fs.writeFile('/tmp/gyms.csv', csv, async (err) => {
                if (err) {
                    await msg.channel.send(err);
                } else {
                    await msg.channel.send('Done!');
                }
            });
        } catch (e) {
            await msg.channel.send(e.message);
            console.log(e);
        }
    }
};
