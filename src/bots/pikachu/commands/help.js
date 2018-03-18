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
            await msg.channel.send('Please consult the user guide/SVP consultez le guide d\'utilisateur: https://drive.google.com/file/d/1AwIL-Y9aSiZDJ0Feg9sz_E84SLLhDRI8/view?usp=sharing');
        } catch (e) {
            await msg.channel.send(e.message);
            console.log(e);
        }
    }
};
