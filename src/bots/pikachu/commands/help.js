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
            await msg.channel.send('**Please consult the following guide/SVP consultez le guide suivant:** https://github.com/tatumalenko/pokemon-go-montreal/tree/master/src/bots/pikachu');
        } catch (e) {
            await msg.channel.send(e.message);
            console.log(e);
        }
    }
};
