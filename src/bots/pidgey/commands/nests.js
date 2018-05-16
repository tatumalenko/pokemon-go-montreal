const PokedexEntry = require('../../../models/PokedexEntry');

module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'nests',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: ['nest', 'nid', 'nids'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            if (args.length === 0) {
                await msg.channel.send(this.client.utils.createErrorMsg({
                    english: 'Please specify a Pokemon.',
                    french: 'S\'il vous plaît spécifier un Pokemon.',
                }));
                return;
            }

            const pokedexEntry = await this.getPokedexEntry(args[0]);

            if (pokedexEntry === null) {
                const corrections = this.client.spellchecker.getCorrections(args[0]).join(', ');

                await msg.channel.send(this.client.utils.createErrorMsg({
                    english: `Unknown Pokémon ${args[0]}. Did you mean:`,
                    french: `Pokémon inconnu ${args[0]}. Vouliez-vous dire:\n ${corrections}`,
                }));

                return;
            }

            const nests = await this.client.nestRepository.fetchNests(pokedexEntry.number);

            // Build the right message.
            if (nests.length === 0) {
                await msg.channel.send(this.client.utils.createErrorMsg({
                    english: `No nest found for ${pokedexEntry.nameEn} #${pokedexEntry.number}.`,
                    french: `Aucun nid trouvé pour ${pokedexEntry.nameFr} #${pokedexEntry.number}.`,
                }));
                return;
            }

            let description =
                '**Nids répertoriés par des joueurs sur [TheSilphRoad](<https://thesilphroad.com/atlas#10.8/45.5389/-73.6532>)**\n' +
                '**Nests reported by players on [TheSilphRoad](<https://thesilphroad.com/atlas#10.8/45.5389/-73.6532>)**\n';

            nests.forEach((nest) => {
                description += `\t:arrow_forward: ${nest.location.neighbourhood}: [Google Link](<${nest.location.gmapsUrl}>)\n`;
            });

            await msg.channel.send({
                embed: {
                    title: `${pokedexEntry.nameEn}/${pokedexEntry.nameFr} #${pokedexEntry.number}`,
                    description,
                    thumbnail: {
                        url: `http://floatzel.net/pokemon/black-white/sprites/images/${pokedexEntry.number}.png`,
                    },
                },
            });
        } catch (e) {
            await msg.channel.send(e.message);
            console.error(e);
        }
    }

    /**
     * Get a PokedexEntry object based on a pokemon name or pokedex number.
     * @param {*} input
     * @returns {PokedexEntry}
     */
    async getPokedexEntry(input) {
        const pokemonListEn = this.client.utils.getPokemonNames();
        const pokemonListFr = this.client.utils.getPokemonNames('french');
        let pokemonNameEn = '';
        let pokemonNameFr = '';
        let pokedexNumber = -1;
        // eslint-disable-next-line
        if (isNaN(input)) {
            if (!pokemonListEn.includes(input) && !pokemonListFr.includes(input)) {
                return null;
            }
            pokemonNameEn = this.client.utils.getEnglishName(input);
            pokedexNumber = pokemonListEn.indexOf(pokemonNameEn) + 1;
        } else {
            pokedexNumber = input;
            pokemonNameEn = pokemonListEn[pokedexNumber - 1];
        }

        pokemonNameFr = pokemonListFr[pokedexNumber - 1];

        return new PokedexEntry({ number: pokedexNumber, nameFr: pokemonNameFr, nameEn: pokemonNameEn });
    }
};
