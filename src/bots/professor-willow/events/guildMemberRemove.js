module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'guildMemberRemove',
            enabled: true,
            eventName: 'guildMemberRemove',
            description: '',
        });
    }

    // eslint-disable-next-line class-methods-use-this
    async run(member, ...params) {
        try {
            const channel = await this.client.guilds.find('name', this.client.configs.guildId).channels.find('name', this.client.configs.channels.adminMods);
            await channel.send(`Gee-Golly. ${member.displayName} has left us.  😢`);
        } catch (e) {
            console.error(e);
        }
    }
};

