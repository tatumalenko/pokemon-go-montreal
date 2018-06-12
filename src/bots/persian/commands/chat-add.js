module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'chat-add',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: [],
            description: 'Add someone to a messenger chat.',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            // Check channel.
            if (msg.channel.id !== this.client.configs.persian.chats.managementChannel) {
                return;
            }

            // Check command syntax.
            if (args.length !== 2) {
                msg.channel.send(`Syntax: ${prefix}${cmd} <channel> <user>`);
                return;
            }

            // Fetch messengerChat.
            const discordChannel = args[0].match(/<#(\d*)>/);
            if (discordChannel == null) {
                await msg.channel.send(this.client.utils.createErrorMsg({
                    english: `${args[0]} is not a valid channel.`,
                    french: `${args[0]} n'est pas un channel valide.`,
                }));
                return;
            }
            const chat = await this.client.messengerChatRepository.fetch(discordChannel);

            // Validate user role.
            if (!msg.member.roles.has(chat.adminRole)) {
                await msg.channel.send(this.client.utils.createErrorMsg({
                    english: `Wait a minute, you're not admin of that chat: ${args[0]}`,
                    french: `Wooo! T'es pas admin de ce chat là: ${args[0]}`,
                }));
                return;
            }

            // Validate that the user exists.
            const memberParts = args[1].match(/(.*)#(\d*)/);
            const guildMember = msg.guild.members.filter(m =>
                m.user.username === memberParts[1] &&
                m.user.discriminator === memberParts[2]).first();

            // Apply new role.
            const accessRole = msg.guild.roles.get(chat.accessRole);
            guildMember.addRole(accessRole).catch(console.error);

            // Output
            msg.channel.send('Done!');
        } catch (e) {
            await msg.channel.send(this.client.utils.createErrorMsg({
                english: 'An error occured.',
                french: 'Une erreur est survenue.',
            }));
            this.client.logger.logError(e);
        }
    }
};
