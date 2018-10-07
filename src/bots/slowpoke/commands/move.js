const pd = require('../assets/modules/pokedex');

module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'move',
            enabled: true,
            runIn: ['test-zone'],
            cooldown: 0,
            aliases: ['moves'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            if (pd.isMoveName(args.join(' '))) {
                await msg.channel.send({
                    embed: pd.moveInfo(new pd.Move({
                        name: args.join(' '),
                    })),
                });
            } else {
                throw new Error(`${args.join(' ')} is not a move name.`);
            }
        } catch (e) {
            console.error(`${process.env.name}.${this.name}: \n${e}`);
            if (e.message) {
                await msg.guild.channels.find('name', this.client.configs.channels.botLogs).send(`${process.env.name}.${this.name}: ${e.message}`);
                await msg.channel.send(`${process.env.name}.${this.name}: ${e.message}`);
            }
        }
    }
};
