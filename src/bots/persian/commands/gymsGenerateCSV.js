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

            let gyms = [];
            if (args.includes('eligible')) {
                gyms = await this.client.gymRepository.fetchEligibleGyms();
            } else {
                gyms = await this.client.gymRepository.fetchAllGyms();
            }

            // Building CSV structure
            let csv = 'Gym Name,Latitude,Longitude\n';
            gyms.forEach((element) => {
                // We get some gyms from Vancouver. This condition exclude them.
                if (parseInt(element.longitude, 10) < -74) {
                    return;
                }

                const name = element.name.replace(',', ' ');
                // if (element.eligible) {
                //    name += '(Eligible)';
                // }

                csv += `"${name}",${element.latitude},${element.longitude}\n`;
            });

            // Output the file
            // TODO: Configure output path
            fs.writeFile('/tmp/gyms.csv', csv, async (err) => {
                if (err) {
                    await msg.channel.send(err);
                } else {
                    let eligibleText = '';
                    if (args.includes('eligible')) {
                        eligibleText = ' eligible';
                    }

                    msg.channel.send(`Here's a CSV file of all the${eligibleText} gyms in the database.\n` +
                    'Be aware that this list is not complete.', {
                        files: [
                            '/tmp/gyms.csv',
                        ],
                    });
                }
            });
        } catch (e) {
            await msg.channel.send(e.message);
            console.log(e);
        }
    }
};
