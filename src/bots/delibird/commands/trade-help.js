module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'trade-help',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: [],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            msg.channel.send({
                embed: {
                    title: 'List of commands',
                    description: '\`\`\`md\n' +
                    `<${prefix}trade-want pokémon>:\n\t Add a pokémon to your 'want' list.\n` +
                    `<${prefix}trade-add pokémon>: \n\t Add a pokémon that you are willing to trade away.\n` +
                    `<${prefix}trade-list user>:\n\t List\n` +
                    `<${prefix}trade-search pokémon>:\n\t Search for user willing to trade a specific ppokémon.` +
                    '\`\`\`',
                },
            });
        } catch (e) {
            await msg.channel.send(this.client.utils.createErrorMsg({
                english: 'An error occured.',
                french: 'Une erreur est survenue.',
            }));
            this.client.logger.logError(e);
        }
    }
};
