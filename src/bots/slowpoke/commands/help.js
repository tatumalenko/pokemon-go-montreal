module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'help',
            enabled: true,
            runIn: ['test-zone'],
            cooldown: 0,
            aliases: ['aide', 'info'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            await msg.channel.send({
                embed: {
                    description: '**Slowpoke bot here!** `These are some of the cool things you can ask me to tell you about.`\n'
                        + '\n**Basic commands**:'
                        + '\n**`\'!pd <name>\'`**: \n       `will display Pokemon stat and moveset info for Pokemon <name> at level 39 and for perfect IVs`'
                        + '\n**`\'!pd <move>\'`**: \n       `will display some basic stats for Move name <move>`\n'

                        + '\n**Advanced commands**:'
                        + '\n**`\'!pd <name> level <num>\'`**: \n          `will display all CP combos possible for IV > 90% of Pokemon <name> at level <num>`'
                        + '\n**`\'!pd <name> cp <num>\'`**: \n          `will display all IV combos possible for cp = num & level 20`'
                        + '\n**`\'!pd <name> cp <num1> level <num2>\'`**: \n          `will display all IV combos possible for cp <num1> & level <num2>`'
                        + '\n**`\'!pd <name> iv <num1>/<num2>/<num3> level <num4>\'`**: \n          `will display CP & other stat info for Pokemon <name> at level <num4> with IV values in <atk>/<def>/<sta> format`'

                        + '\n\n** Note**: `Here are what the emojis seen when I report a full Pokemon spec card represent.`'
                        + '\n**`Next to each Pokemon\'s fast or charge move`**: \n          `(`<:power1:385003640622153728>`:Power|`<:lightning1:385004007669891072>`:Energy|`<:stopwatch1:385003619302506498>`:Duration[secs])`'
                        + '\n**`Next to each Pokemon\'s fast/charge moveset`**: \n          `(`<:swords1:385001990268125184>` Offensive Perfection| `<:shield1:385001970391318538>` Defensive Perfection)`'

                        + '\n\n`Offensive and Defensive Perfection represent the \% approaching value to that of the best moveset (i.e. normalized) '
                        + 'for either they\'re better at attacking (Offensive) or defending (Defensive). In other words, 100\% is the best and the lower is the worst.`'
                        + '\n\n`For more details on how the values were calculated and see some examples, type` **`\'!dex examples\'`** ',
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
