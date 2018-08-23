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
            const channel = await this.client.guilds.find('id', this.client.configs.guildId).channels.find('name', this.client.configs.channels.joinTeam);
            const rulesChannel = await this.client.guilds.find('id', this.client.configs.guildId).channels.find('name', 'regles-rules');
            const greeting = `**Welcome to Pokémon GO Montréal**, ${member
            }! Please make sure to read the rules in ${rulesChannel}! `
            + 'Set your team here by typing either `!team mystic`, `!team instinct`, or `!team valor`. '
            + '\n**--------------**\n'
            + `**Bienvenue à Pokémon GO Montréal**, ${member
            }! S'il vous plaît assurez-vous de lire les règlements dans ${rulesChannel}! `
            + 'Définissez votre équipe ici en tapant soit `!team mystic`, `!team instinct`, ou `!team valor`.';
            await channel.send(greeting);
        } catch (e) {
            console.error(e);
        }
    }
};

