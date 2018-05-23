module.exports = class {
    static async print(gymList, channel) {
        if (gymList.length > 5) {
            await channel.send(this.client.utils.createErrorMsg({
                english: `Too many results (${gymList.length}), please narrow down your search.`,
                french: `Trop de résultats (${gymList.length}), s'il vous plaît affiner votre recherche.`,
            }));
        } else if (gymList.length > 0) {
            gymList.forEach((gym) => {
                let description = `[Google Map](<https://maps.google.com/maps?q=${gym.latitude},${gym.longitude}>)`;
                if (gym.eligible) {
                    description += '\nEligible';
                }

                channel.send({
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
            await channel.send(this.client.utils.createErrorMsg({
                english: 'No result found (Keep in mind this database is not complete).',
                french: 'Aucun résultat (Garder en tête que cette base de données n\'est pas complete).',
            }));
        }
    }
};
