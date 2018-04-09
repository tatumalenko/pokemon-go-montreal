const request = require('request');
const Location = require('../../../models/Location.js');

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

            // TODO: Extract that logic...
            const pokemonListEn = this.client.utils.getPokemonNames();
            const pokemonListFr = this.client.utils.getPokemonNames('french');
            let pokemonNameEn = '';
            let pokemonNameFr = '';
            let pokedexNumber = -1;
            // eslint-disable-next-line
            if (isNaN(args[0])) {
                if (!pokemonListEn.includes(args[0]) && !pokemonListFr.includes(args[0])) {
                    const test = this.client.spellchecker.getCorrections(args[0]).join(', ');

                    await msg.channel.send(this.client.utils.createErrorMsg({
                        english: `Unknown Pokémon ${args[0]}. Did you mean:`,
                        french: `Pokémon inconnu ${args[0]}. Vouliez-vous dire:\n ${test}`,
                    }));
                    return;
                }
                pokemonNameEn = this.client.utils.getEnglishName(args[0]);
                pokedexNumber = pokemonListEn.indexOf(pokemonNameEn) + 1;
            } else {
                [pokedexNumber] = args;
                pokemonNameEn = pokemonListEn[pokedexNumber - 1];
            }

            pokemonNameFr = pokemonListFr[pokedexNumber - 1];

            const nests = await this.client.nestRepository.fetchNests(pokedexNumber);

            if (nests.length === 0) {
                await msg.channel.send(this.client.utils.createErrorMsg({
                    english: `No nest found for ${pokemonNameEn} #${pokedexNumber}.`,
                    french: `Aucun nid trouvé pour ${pokemonNameFr} #${pokedexNumber}.`,
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
                    title: `${pokemonNameEn}/${pokemonNameFr} #${pokedexNumber}`,
                    description,
                    thumbnail: {
                        url: `http://floatzel.net/pokemon/black-white/sprites/images/${pokedexNumber}.png`,
                    },
                },
            });
        } catch (e) {
            await msg.channel.send(e.message);
            console.error(e);
        }
    }
};
