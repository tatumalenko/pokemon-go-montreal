// const Utils = require('../../../utils/Utils');

module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'guildMemberAdd',
            enabled: true,
            eventName: 'guildMemberAdd',
            description: '',
        });
    }

    // eslint-disable-next-line class-methods-use-this
    async run(member, ...params) {
        try {
            await this.client.userRepository.addUser(member);
        } catch (e) {
            console.log(e);
        }
    }
};

