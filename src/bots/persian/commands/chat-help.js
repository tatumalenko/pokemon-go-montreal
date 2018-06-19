module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'chat-help',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: [],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            // Check channel.
            if (msg.channel.id !== this.client.configs.persian.chats.managementChannel) {
                return;
            }

            msg.channel.send({
                embed: {
                    title: 'List of commands',
                    description: '\`\`\`md\n' +
                    `<${prefix}chat-list>:\n\t List all chat configured to be private.\n` +
                    `<${prefix}chat-add channel user>: \n\t Add someone to a private chat.\n` +
                    `<${prefix}chat-create channel admin-role access-role>:\n\t Create new private chat. (Only admins can run this command)` +
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
