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
            const spawn = new WildSpawn(createWildSpawnParams(msg));

            const spawnEmbed = this.createWildSpawnEmbed(spawn); // embed = {content, embed}, it's weird, I know..

            // if (spawn.iv === 'NA') { spawn.iv = 0; }

            // if (spawn.level === 'NA') { spawn.level = 0; }

            const recipients = await this.findDiscordRecipients(spawn);

            console.log(recipients.map(r => r.displayName));

            // await sendEmbedToRepicients([this.client.guilds.get(this.client.configs.guildId).members.find('displayName', 'uphillsimplex')], spawnEmbed);
            await sendEmbedToRepicients(recipients, spawnEmbed); // Post in DM channel to members
            // await sendEmbedToRepicients([msg.guild.channels.find('name', 'wilds-post')], spawnEmbed); // Post in wilds-post channel
        } catch (e) {
            console.log(e);
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

function createWildSpawnParams(message) {
    const msg = message.content.replace(/\*/g, '');
    const spawnParams = {
        // Common to Spawn BELOW
        name: /[\[.*\]]?\s?([a-zA-Z]+|[a-zA-Z]+ - \w|[a-zA-Z]+[\'][a-zA-Z]+)\s?-?\s? \((\d+%)\)/.exec(msg)
            ? /[\[.*\]]?\s?([a-zA-Z]+|[a-zA-Z]+ - \w|[a-zA-Z]+[\'][a-zA-Z]+)\s?-?\s? \((\d+%)\)/.exec(msg)[1]
            : /[\[.*\]]?\s?([a-zA-Z]+|[a-zA-Z]+\s?-?\s?\w)\s?-?\s?\n\n/.exec(msg)[1],
        // Common to Spawn ABOVE
        // --------------------------------
        // Unique to WildSpawn BELOW
        iv: /\((\d+)%\)/.exec(msg) ? Number(/\((\d+)%\)/.exec(msg)[1]) : 'NA',
        cp: /\(CP: (\d+)\)/.exec(msg) ? Number(/\(CP: (\d+)\)/.exec(msg)[1]) : 'NA',
        level: /\(Level: (-?\d+)\)/.exec(msg) ? Number(/\(Level: (-?\d+)\)/.exec(msg)[1]) : 'NA',
        stats: {
            iv: {
                attack: /L30\+ IV: (\d+) - \d+ - \d+ .*/.exec(msg) ? Number(/L30\+ IV: (\d+) - \d+ - \d+ .*/.exec(msg)[1]) : 'NA',
                defense: /L30\+ IV: \d+ - (\d+) - \d+ .*/.exec(msg) ? Number(/L30\+ IV: \d+ - (\d+) - \d+ .*/.exec(msg)[1]) : 'NA',
                stamina: /L30\+ IV: \d+ - \d+ - (\d+) .*/.exec(msg) ? Number(/L30\+ IV: \d+ - \d+ - (\d+) .*/.exec(msg)[1]) : 'NA',
            },
        },
        weatherBoosted: /Weather boosted: (.*)\n/.exec(msg) ? /Weather boosted: (.*)\n/.exec(msg)[1] : 'NA',
        gender: /Gender: (.*)\n/.exec(msg) ? /Gender: (.*)\n/.exec(msg)[1] : 'NA',
        // Unique to WildSpawn ABOVE
        // --------------------------------
        // Common to Spawn BELOW
        moveset: {
            fast: /L30\+ Moveset: (.*) - .*/.exec(msg) ? /L30\+ Moveset: (.*) - .*/.exec(msg)[1] : 'NA',
            charge: /L30\+ Moveset: .* - (.*)/.exec(msg) ? /L30\+ Moveset: .* - (.*)/.exec(msg)[1] : 'NA',
        },
        time: {
            remaining: /Until: .* \((.*) left\)/.exec(msg) ? /Until: .* \((.*) left\)/.exec(msg)[1] : 'NA',
            ending: /Until: (.*) \(.* left\)/.exec(msg) ? /Until: (.*) \(.* left\)/.exec(msg)[1] : 'NA',
        },
        location: {
            coordinates: {
                latitude: /.*q=(\d+.\d+),-\d+.\d+/.exec(msg) ? Number(/.*q=(\d+.\d+),-\d+.\d+/.exec(msg)[1]) : 'NA',
                longitude: /.*q=\d+.\d+,(-\d+.\d+)/.exec(msg) ? Number(/.*q=\d+.\d+,(-\d+.\d+)/.exec(msg)[1]) : 'NA',
            },
            address: /Address: (.*)\n/.exec(msg) ? /Address: (.*)\n/.exec(msg)[1].trim() : 'NA',
            gmapsUrl: /Google Map: <?(.*)>?/.exec(msg) ? /Google Map: <?(.*)>?/.exec(msg)[1] : 'NA',
        },
    };
    return spawnParams;
}

async function sendEmbedToRepicients(recipients, {
    content,
    embed,
}) {
    let totalAlertsSent = 0;
    const successAlertRecipients = [];

    await Promise.all(recipients.map(async (recipient) => {
        try {
            totalAlertsSent += 1;
            successAlertRecipients.push(recipient.displayName !== undefined ? recipient.displayName : recipient.name);
            return recipient.send(content, embed);
        } catch (e) {
            console.log(e);
        }
    }));

    console.log(`${content}\nAlerts sent: ${totalAlertsSent} (${successAlertRecipients.join(', ')})`);
    console.log('-----------------------------------------------------------------');
}
