module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'examples',
            enabled: true,
            runIn: ['test-zone'],
            cooldown: 0,
            aliases: ['exemple', 'example', 'exemple'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            await msg.channel.send({
                embed: {
                    description: '\n**Basic examples**: '
                        + '\n`\'!pd entei\' `'
                        + '\n`\'!pd dazzling gleam\' `\n'

                        + '\n**Advanced examples**:'
                        + '\n`\'!pd entei level 20\' `'
                        + '\n`\'!pd entei cp 1913\' `'
                        + '\n`\'!pd entei cp 2972 level 32\' `'
                        + '\n`\'!pd entei iv 12/14/13 level 30\' `'
                        + '\n\n`The formulas used to rank the movesets are somewhat complicated. The approach '
                        + 'used is well described in this spreadsheet found` [here](https://www.reddit.com/r/TheSilphRoad/comments/5v0svt/updated_pok%C3%A9mon_go_species_data_and_moveset/).'
                        + '\n\n`You might notice some discrepencies (especially for the Defensive Perfection values) from other sources such as PokeGenie. This is expected is '
                        + 'no single method for determining the \'best\' stats/movesets given all the assumptions when not knowing exactly who is the defender. '
                        + 'These are just rough guidelines and are subjective.`',
                },
            });
        } catch (e) {
            console.error(`${process.env.name}.${this.name}: \n${e}`);
            if (e.message) {
                await msg.guild.channels.find('name', this.client.configs.channels.botLogs).send(`${process.env.name}.${this.name}: ${e.message}`);
                await msg.channel.send(`${process.env.name}.${this.name}: ${e.message}`);
            }
        }
    }
};
