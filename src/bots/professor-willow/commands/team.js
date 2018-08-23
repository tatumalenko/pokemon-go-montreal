module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'team',
            enabled: true,
            runIn: ['welcome'], // [] = uses app.js runIn property values
            aliases: ['team', 'equipe', 'équipe'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            const validTeamNames = ['valor', 'instinct', 'mystic'];
            const memberRoleNames = msg.member.roles.array().map(e => e.name);
            const requestedTeamName = args[0].toLowerCase();

            const isValidTeam = validTeamNames.includes(requestedTeamName);
            const hasRequestedTeam = memberRoleNames.includes(requestedTeamName);
            const hasAnyTeam = validTeamNames.some(e => memberRoleNames.includes(e));

            if (!isValidTeam) {
                // Do nothing..
            } else if (hasRequestedTeam) {
                await msg.channel.send(`You already have that team role, ${msg.member}!`);
            } else if (hasAnyTeam) {
                const currentTeamName = validTeamNames.find(e => memberRoleNames.includes(e));
                const currentTeamRole = msg.guild.roles.find('name', currentTeamName);
                const requestedTeamRole = msg.guild.roles.find('name', requestedTeamName);
                await msg.member.removeRole(currentTeamRole);
                await msg.member.addRole(requestedTeamRole);
                await msg.channel.send(`Alright, ${msg.member}, switched you to team ${requestedTeamName}!`);
            } else {
                const requestedTeamRole = msg.guild.roles.find('name', requestedTeamName);
                await msg.member.addRole(requestedTeamRole);
                await msg.channel.send(`Got it! Added ${msg.member} to team ${requestedTeamName}!`);
            };
        } catch (e) {
            console.error(e);
        }
    }
};
