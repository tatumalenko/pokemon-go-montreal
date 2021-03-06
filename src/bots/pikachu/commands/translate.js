module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'translate',
            enabled: true,
            runIn: ['all'], // [] = uses app.js runIn property values
            aliases: ['traduit'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            const word = args.join(' ');
            await msg.channel.send(this.client.utils.getTranslation(word));
        } catch (e) {
            await msg.channel.send(this.client.utils.createErrorMsg({
                english: 'Oops! That doesn\'t seem to be a Pokemon name!',
                french: 'Oops! Ce mot ne semble pas être un nom de Pokemon!',
            }));
            console.error(e);
            await msg.channel.send(e.message);
            await this.client.logger.logInfo(`${process.env.name}.${this.name}: ${e.message}`);
        }
    }
};
