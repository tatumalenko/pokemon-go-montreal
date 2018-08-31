module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'role',
            enabled: true,
            runIn: ['role-management'],
            cooldown: 0,
            aliases: ['roles'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            if (!msg.member.roles.some(role => role.name === 'admin' || role.name === 'mod' || role.name === 'mega-bot')) {
                await msg.channel.send('You do not have permission for this command! You n\'avez pas la permissions d\'utiliser cette commande!');
                return;
            }
            const roleToEditName = args[1];
            const roleToEdit = await this.client.guilds.find('id', this.client.configs.guildId).roles.find('name', roleToEditName);
            let roleMember = msg.mentions.members.first();
            const roleMemberName = args[2];
            if (!roleMember) {
                roleMember = await this.client.guilds.find('id', this.client.configs.guildId).members.find(e => e.displayName === roleMemberName);
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
            console.error(`${process.env.name}.${this.name}: \n${e}`);
            if (e.message) { await msg.guild.channels.find('name', this.client.configs.channels.botLogs).send(`${process.env.name}.${this.name}: ${e.message}`); }
        }
    }
};
