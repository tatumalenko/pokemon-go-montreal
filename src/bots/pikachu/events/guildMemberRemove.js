// const Utils = require('../../../utils/Utils');

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
            await this.client.userRepository.remove(member);
        } catch (e) {
            console.error(e);
            await this.client.logger.logError(`${process.env.name}.${this.name}: ${e.message}`);
        }
    }
};

