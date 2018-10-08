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
            console.error(e);
            await this.client.logger.logError(`${process.env.name}.${this.name}: ${e.message}`);
        }
    }
};

