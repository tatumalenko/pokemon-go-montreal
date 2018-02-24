module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'help',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: ['aide', 'info'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            await msg.channel.send('Some help will arrive shortly! *I hope*');
        } catch (e) {
            await msg.channel.send(e.message);
            console.log(e);
        }
    }
};
