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
            console.error(`${process.env.name}.${this.name}: \n${e}`);
            if (e.message) { await this.client.guilds.find('id', this.client.configs.guildId).channels.find('name', this.client.configs.channels.botLogs).send(`${process.env.name}.${this.name}: ${e.message}`); }
        }
    }
};

