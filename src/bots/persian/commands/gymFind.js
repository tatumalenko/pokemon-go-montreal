

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
            // TODO: extract.
            if (foundGyms.length > 5) {
                await msg.channel.send(this.client.utils.createErrorMsg({
                    english: `Too many results (${foundGyms.length}), please narrow down your search.`,
                    french: `Trop de résultats (${foundGyms.length}), s'il vous plaît affiner votre recherche.`,
                }));
            } else if (foundGyms.length > 0) {
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
