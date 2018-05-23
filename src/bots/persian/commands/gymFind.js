const GymPrinter = require('../helpers/gymPrinter.js');

module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'gym-find',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: [],
            description: 'Find gym with location.',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            if (args.length === 0) {
                msg.channel.send(`Syntax: ${prefix}${cmd} <latitude> <longitude>`);
                return;
            }

            const foundGyms = await this.client.gymRepository.fetchByLocation(args[0], args[1]);

            // Output
            GymPrinter.print(foundGyms, msg.channel);
        } catch (e) {
            await msg.channel.send(this.client.utils.createErrorMsg({
                english: 'An error occured.',
                french: 'Une erreur est survenue.',
            }));
            this.client.logger.logError(e);
        }
    }
};
