module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'role',
            enabled: true,
            runIn: ['role-management', '4200-st-laurent-raid-break', '502678237302882304'],
            cooldown: 0,
            aliases: ['roles', 'rôle', 'rôles'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            // Temp fix to prevent removal of capitalization of params passed by default
            // eslint-disable-next-line
            const { prefix, cmd, args } = this.utils.parseMessageForCommand(msg, false);

            const roleToEditName = args[1];
            const roleToEdit = await this.client.guilds.find('id', this.client.configs.guildId).roles.find('name', roleToEditName);

            // If the role cannot be found.
            if (!roleToEdit) {
                throw new Error('The role could not be found! Le role ne semble pas être valid.');
            }

            let roleMember = msg.mentions.members.first();
            const roleMemberName = args[2];

            // Then the member argument isn't present at all -> assume themself as member to edit.
            if (roleMember === undefined && roleMemberName === undefined) {
                roleMember = msg.member;
            } else if (roleMemberName) {
                roleMember = await this.client.guilds.find('id', this.client.configs.guildId).members.find(e => e.displayName === roleMemberName);
            }

            // If still not successful at this point, then member could not be found.
            if (!roleMember) {
                throw new Error('The member could not be found! Le membre ne semble pas être valid.');
            }

            if (!msg.member.roles.some(role => role.name === 'admin' || role.name === 'mod' || role.name === 'mega-bot')
                    && msg.member.id !== roleMember.id) {
                await msg.channel.send('You do not have permission for this command! You n\'avez pas la permissions d\'utiliser cette commande!');
                return;
            }

            switch (args[0].toLowerCase()) {
                case 'add':
                    await roleMember.addRole(roleToEdit);
                    await msg.channel.send(`Got it! Gave ${roleToEdit.name} access to ${roleMember.displayName}`);
                    break;

                case 'remove':
                    await roleMember.removeRole(roleToEdit);
                    await msg.channel.send(`Got it! Removed ${roleToEdit.name} access to ${roleMember.displayName}`);
                    break;

                default:
                    break;
            }

            return;
        } catch (e) {
            console.error(e);
            await msg.channel.send(e.message);
            await this.client.logger.logInfo(`${process.env.name}.${this.name}: ${e.message}`);
        }
    }
};
