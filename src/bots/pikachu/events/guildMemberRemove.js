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
            await this.client.userRepo.remove(member);
        } catch (e) {
            console.error(`${process.env.name}.${this.name}: \n${e}`);
            if (e.message) { await this.client.guilds.find('id', this.client.configs.guildId).channels.find('name', this.client.configs.channels.botLogs).send(`${process.env.name}.${this.name}: ${e.message}`); }
        }
    }
};

