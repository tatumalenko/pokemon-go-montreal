module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'chat-map',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: [],
            description: 'Map a messenger channel with roles.',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            // Check channel.
            if (msg.channel.id !== this.client.configs.persian.chats.managementChannel) {
                return;
            }

            // Check role.
            const allowedRole = msg.guild.roles.find('name', this.client.configs.persian.chats.globalAdminRole);
            if (allowedRole != null) {
                if (!msg.member.roles.has(allowedRole.id)) {
                    await msg.channel.send(this.client.utils.createErrorMsg({
                        english: 'Only admins are allowed to configure new messenger chats.',
                        french: 'Seuls les administrateurs peuvent configurer de nouveau chats messenger.',
                    }));
                    return;
                }
            } else {
                this.client.logger.logError(`The configured 'globalAdminRole' for persian is not valid: ${this.client.configs.persian.chats.globalAdminRole}`);
                return;
            }

            // Check command syntax.
            if (args.length !== 3) {
                msg.channel.send(`Syntax: ${prefix}${cmd} <channel> <admin-role> <access-role>`);
                return;
            }

            // Validate channel.
            const discordChannel = args[0].match(/<#(\d*)>/);
            if (discordChannel == null) {
                await msg.channel.send(this.client.utils.createErrorMsg({
                    english: `${args[0]} is not a valid channel.`,
                    french: `${args[0]} n'est pas un channel valide.`,
                }));
                return;
            }

            // Validate that the roles provided exist.
            const adminRole = msg.guild.roles.find('name', args[1]);
            if (adminRole == null) {
                await msg.channel.send(this.client.utils.createErrorMsg({
                    english: `${args[1]} is not a valid role name.`,
                    french: `${args[1]} n'est pas un nom de rôle valide.`,
                }));
                return;
            }
            const accessRole = msg.guild.roles.find('name', args[2]);
            if (accessRole == null) {
                await msg.channel.send(this.client.utils.createErrorMsg({
                    english: `${args[2]} is not a valid role name.`,
                    french: `${args[2]} n'est pas un nom de rôle valide.`,
                }));
                return;
            }

            // Create/update the mapping.
            await this.client.messengerChatRepository.update({
                discordChannel: discordChannel[1],
                adminRole: adminRole.id,
                accessRole: accessRole.id,
            });

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
