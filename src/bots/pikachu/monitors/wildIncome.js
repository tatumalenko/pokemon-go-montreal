const WildSpawn = require('../../../models/WildSpawn');

module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'wildIncome',
            enabled: true,
            runIn: ['discord-income'], // if = [] -> uses app.js runIn property values
            description: '',
        });
    }

    async run(msg, ...params) {
        try {
            const spawn = new WildSpawn(this.client.utils.createWildSpawnParams(msg));

            const spawnEmbed = this.createWildSpawnEmbed(spawn); // embed = {content, embed}, it's weird, I know..

            // if (spawn.iv === 'NA') { spawn.iv = 0; }

            // if (spawn.level === 'NA') { spawn.level = 0; }

            const recipients = await this.findDiscordRecipients(spawn);

            try {
                console.log(recipients.map(r => r.displayName));
            } catch (e) {
                console.log(e);
            }

            // await this.client.utils.sendEmbedToRepicients([this.client.guilds.get(this.client.configs.guildId).members.find('displayName', 'uphillsimplex')], spawnEmbed);
            await this.client.utils.sendEmbedToRepicients(recipients, spawnEmbed); // Post in DM channel to members
            await this.client.utils.sendEmbedToRepicients([msg.guild.channels.find('name', this.client.configs.channels.wildAlerts)], spawnEmbed); // Post in wilds-post channel
        } catch (e) {
            console.error(`${process.env.name}.${this.name}: \n${e}`);
            if (e.message) { await this.client.guilds.get(this.client.configs.guildId).channels.find('name', this.client.configs.channels.botLogs).send(e.message); }
        }
    }

    createWildSpawnEmbed(spawn) {
        // if (spawn.level < 0) {
        //     const ivRegExp = /\s*(\d*)\s*-\s*(\d*)\s*-\s*(\d*)/.exec(spawn.stats);
        //     const ctx = {
        //         name: spawn.name,
        //         cp: spawn.cp,
        //         iv: {
        //             atk: parseInt(ivRegExp[1], 10),
        //             def: parseInt(ivRegExp[2], 10),
        //             sta: parseInt(ivRegExp[3], 10),
        //         },
        //     };
        //     const pkmn = new pd.Pokemon(ctx);
        //     spawn.level = pkmn.calcLevel();
        // }

        const content =
        `Pika! Wild ${spawn.name} (IV: ${spawn.iv} - CP: ${spawn.cp} - LV: ${spawn.level}) spawning in ${spawn.location.neighbourhood}!\n` +
        `Details: ${spawn.location.address}`;

        const embed = {
            embed: {
                title: `Click here for directions to the wild ${spawn.name}!\n`,
                description:
                    `**Neighbourhood:** ${spawn.location.neighbourhood}\n` +
                    `**Spawns Until:** ${spawn.time.ending} (${spawn.time.remaining} left)\n` +
                    `**Stats:** ${spawn.stats.iv.attack} - ${spawn.stats.iv.defense} - ${spawn.stats.iv.stamina} (${spawn.iv}%)\n` +
                    `**Moveset:** ${spawn.moveset.fast} - ${spawn.moveset.charge}\n` +
                    `**Gender:** ${spawn.gender}\n` +
                    `**Weather Boosted:** ${spawn.weatherBoosted}\n` +
                    `**Address:** ${spawn.location.address}`,
                timestamp: new Date(),
                url: spawn.location.gmapsUrl,
                color: 3066993,
                thumbnail: {
                    url: `http://floatzel.net/pokemon/black-white/sprites/images/${spawn.name.toLowerCase().includes('unown') ? 201 : (this.client.utils.getPokemonNames().findIndex(name => (name === spawn.name.toLowerCase())) + 1)}.png`,
                },
            },
        };

        return {
            content,
            embed,
        };
    }

    async findDiscordRecipients(spawn) {
        try {
            const filteredUserIds = (await this.client.userRepository.findUsers(spawn)).map(user => user.id);
            const filteredDiscordMembers = await filteredUserIds.map(id => this.client.guilds.get(this.client.configs.guildId).members.find('id', id));
            return filteredDiscordMembers;
        } catch (err) {
            console.log(err);
        }
    }
};
