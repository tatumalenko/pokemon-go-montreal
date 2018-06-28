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
            if (!await this.assertSyntax(args, msg.channel)) {
                return;
            }

            const pokedexEntry = await this.getPokedexEntry(args[0]);

            if (!await this.assertValidPokemon(pokedexEntry, args, msg.channel)) {
                return;
            }

            if (!await this.assertPossibleNest(pokedexEntry, msg)) {
                return;
            }

            const nests = await this.client.nestRepository.fetchNests(pokedexEntry.number);

            // Build the right message.
            if (nests.length === 0) {
                await msg.channel.send(this.client.utils.createErrorMsg({
                    english: `No nest found for ${pokedexEntry.nameEn} #${pokedexEntry.number}.`,
                    french: `Aucun nid trouvé pour ${pokedexEntry.nameFr} #${pokedexEntry.number}.`,
                }));
                msg.react('😢');
                return;
            }

            msg.react('✅');

            let description =
                '**Nids répertoriés par des joueurs sur [TheSilphRoad](<https://thesilphroad.com/atlas#10.8/45.5389/-73.6532>)**\n' +
                '**Nests reported by players on [TheSilphRoad](<https://thesilphroad.com/atlas#10.8/45.5389/-73.6532>)**\n';

            nests.forEach((nest) => {
                description += `\t:arrow_forward: ${nest.location.neighbourhood}: [Google Link](<${nest.location.gmapsUrl}>)\n`;
            });

            const embed = await this.createNestEmbed(pokedexEntry, description);
            await msg.channel.send(embed);
        } catch (e) {
            await msg.channel.send(e.message);
            this.client.logger.logError(e);
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

    async createNestEmbed(pokedexEntry, text) {
        return {
            embed: {
                title: `${pokedexEntry.nameEn}/${pokedexEntry.nameFr} #${pokedexEntry.number}`,
                description: text,
                thumbnail: {
                    url: `http://floatzel.net/pokemon/black-white/sprites/images/${pokedexEntry.number}.png`,
                },
            },
        };
    }

    async assertSyntax(args, channel) {
        if (args.length === 0) {
            await channel.send(this.client.utils.createErrorMsg({
                english: 'Please specify a Pokemon.',
                french: 'S\'il vous plaît spécifier un Pokemon.',
            }));
            return false;
        }

        return true;
    }

    async assertValidPokemon(pokedexEntry, args, channel) {
        if (pokedexEntry === null) {
            const corrections = this.client.spellchecker.getCorrections(args[0]).join(', ');

            await channel.send(this.client.utils.createErrorMsg({
                english: `Unknown Pokémon ${args[0]}. Did you mean:`,
                french: `Pokémon inconnu ${args[0]}. Vouliez-vous dire:\n ${corrections}`,
            }));

            return false;
        }

        return true;
    }

    async assertPossibleNest(pokedexEntry, msg) {
        let message = '';
        if (this.client.configs.pidgey.noNest.mythical.includes(pokedexEntry.number)) {
            message = 'This is a mythical Pokémon, they don\'t appear in nests.';
        } else if (this.client.configs.pidgey.noNest.legendaries.includes(pokedexEntry.number)) {
            message = 'This is a legendary Pokémon, they don\'t appear in nests.';
        } else {
            return true;
        }

        msg.react('❌');
        const embed = await this.createNestEmbed(pokedexEntry, message);
        msg.channel.send(embed);
        return false;
    }
};
