module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'chat-list',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: [],
            description: 'List all mapped messenger chats.',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            // Check channel.
            if (msg.channel.id !== this.client.configs.persian.chats.managementChannel) {
                return;
            }

            const chats = await this.client.messengerChatRepository.fetchAll();

            let description = '';
            chats.forEach((chat) => {
                console.log(chat);
                const channel = msg.guild.channels.get(chat.discordChannel);
                const accessRoleName = msg.guild.roles.get(chat.accessRole).name;
                const adminRoleName = msg.guild.roles.get(chat.adminRole).name;

                description += `${channel} -> Admin: '${adminRoleName}' Access: '${accessRoleName}'`;
            });

            // Output
            msg.channel.send({
                embed: {
                    title: 'List of discord chats',
                    description,
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
