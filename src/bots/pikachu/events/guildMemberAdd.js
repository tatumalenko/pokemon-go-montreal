module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'guildMemberAdd',
            enabled: true,
            eventName: 'guildMemberAdd',
            description: '',
        });
    }

    async run(member, ...params) {
        try {
            await this.client.userRepository.addUser(member);
        } catch (e) {
            console.log(e);
            await this.client.guilds.find('id', this.client.configs.guildId).channels.find('name', this.client.configs.channels.botLogs).send(e);
        }
    }
};

