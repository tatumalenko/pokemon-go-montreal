

module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'find-gym',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: [],
            description: '',
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
            const query = corrections.join(' ');
            const foundGyms = await this.client.gymRepository.searchByName(query);

            // Output
            if (foundGyms.length > 0) {
                foundGyms.forEach((gym) => {
                    let description = `[Google Map](<https://maps.google.com/maps?q=${gym.latitude},${gym.longitude}>)`;
                    if (gym.eligible) {
                        description += '\nEligible';
                    }

                    msg.channel.send({
                        embed: {
                            title: gym.name,
                            thumbnail: {
                                url: 'https://img00.deviantart.net/ef10/i/2017/352/2/c/pokemon_go_gym_symbol_in_gray_by_memimouse-dbx4hvm.png',
                            },
                            description,
                            
                        },
                    });
                });
            } else {
                await msg.channel.send(this.client.utils.createErrorMsg({
                    english: 'No result found (Keep in mind this database is not complete).',
                    french: 'Aucun résultat (Garder en tête que cette base de données n\'est pas complete).',
                }));
            }
        } catch (e) {
            await msg.channel.send(this.client.utils.createErrorMsg({
                english: 'An error occured.',
                french: 'Une erreur est survenue.',
            }));
            this.client.logger.logError(e);
        }
    }
};
