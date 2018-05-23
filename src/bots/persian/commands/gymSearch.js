const GymPrinter = require('../helpers/gymPrinter.js');

module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'gym-search',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: [],
            description: 'Search the database for gyms.',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            if (args.length < 1) {
                await msg.channel.send(this.client.utils.createErrorMsg({
                    english: 'Please input a search query.',
                    french: 'S\'il vous plaît entrez une requête pour la recherche.',
                }));
                return;
            }

            let query = args.join(' ');
            if (!query.startsWith('"') || !query.endsWith('"')) {
                // Build the Dictionary with individual words.
                const gyms = await this.client.gymRepository.fetchAllGyms();
                const gymDict = [];
                gyms.forEach((element) => {
                    const split = element.name
                        .replace('-', ' ')
                        .replace('/', ' ')
                        .split(' ');
                    gymDict.push(...split);
                });

                // Spellcheck!
                const word = args.join(' ');
                const corrections = [];
                args.forEach((element) => {
                    const mostLikelyWord = this.client.spellchecker.getCorrections(element, gymDict)[0];
                    corrections.push(mostLikelyWord);
                });

                // Search!
                query = corrections.join(' ');
            }

            const foundGyms = await this.client.gymRepository.searchByName(query);

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
