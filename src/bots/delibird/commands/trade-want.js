module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'trade-want',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: [],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            msg.channel.send('Coming soon.');
        } catch (e) {
            await msg.channel.send(this.client.utils.createErrorMsg({
                english: 'An error occured.',
                french: 'Une erreur est survenue.',
            }));
            this.client.logger.logError(e);
        }
    }
};
