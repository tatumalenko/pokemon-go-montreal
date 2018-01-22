module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'translate',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: ['traduit'],
            description: '',
        });
    }
    // eslint-disable-next-line class-methods-use-this
    async run(msg, { prefix, cmd, args }) {
        try {
            const word = args.join(' ');
            await msg.channel.send(this.client.utils.getTranslation(word));
        } catch (e) {
            await msg.channel.send(this.client.utils.createErrorMsg({
                english: 'Oops! That doesn\'t seem to be a Pokemon name!',
                french: 'Oops! Ce mot ne semble pas être un nom de Pokemon!',
            }));
            console.log(e.message);
        }
    }
};
