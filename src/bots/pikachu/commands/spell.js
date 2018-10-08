module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'spell',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: ['ecrire', 'epeler', 'write', 'name', 'pronounce'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            const word = args.join(' ');
            await msg.channel.send(this.client.spellchecker.correct(word));
        } catch (e) {
            await msg.channel.send(this.client.utils.createErrorMsg({
                english: 'Oops! That doesn\'t seem to be a possible name!',
                french: 'Oops! Ce mot ne semble pas être un nom possible!',
            }));
            console.error(e);
            await msg.channel.send(e.message);
            await this.client.logger.logInfo(`${process.env.name}.${this.name}: ${e.message}`);
        }
    }
};
