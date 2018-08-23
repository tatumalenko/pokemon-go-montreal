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
            const channel = await this.client.guilds.find('name', this.client.configs.guildId).channels.find('name', this.client.configs.channels.joinTeam);
            const greeting = `Welcome to Pokémon GO Montréal, ${member
            }! I'm Professor Willow and will be your guide! Tag me (type @Professor Willow) if ever you want some help or tips! `
                + 'Set your team by typing either `!team mystic`, `!team instinct`, or `!team valor`.';
            await channel.send(greeting);
        } catch (e) {
            console.error(e);
        }
    }
};

