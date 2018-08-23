module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'count',
            enabled: true,
            runIn: ['secret-treehouse', 'moderation', 'super-secret-penthouse', 'bot-testing', 'test-zone'], // [] = uses app.js runIn property values
            aliases: ['counts'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            if (args[0] === undefined) {
                msg.channel.send(`There are **${msg.guild.memberCount}** members currently onboard!`);
            } else if (args[0] === 'days' && args[1] !== undefined) {
                const { guild } = msg;
                let newMembers = 0;
                const days = args[1];
                const daysMs = days * 24 * 60 * 60 * 1000;
                const hours = days * 24;

                const curDate = new Date();
                const curDateMs = curDate.getTime();

                const compareDateMs = curDateMs - daysMs;

                guild.members.forEach((guildMember) => {
                    const joinedDateMs = guildMember.joinedTimestamp;

                    if (joinedDateMs > compareDateMs) {
                        newMembers += 1;
                    }
                });

                msg.channel.send(`There are **${newMembers}** new members in the past ${days} day(s)/${hours} hours!`);
            }
        } catch (e) {
            console.error(e);
            // if (e.msg) { await msg.channel.send(e.msg); }
            // console.error(`${process.env.name}.${this.name}: \n${e}`);
            // if (e.msg) { await msg.guild.channels.find('name', this.client.this.client.configs.channels.botLogs).send(`${process.env.name}.${this.name}: ${e.msg}`); }
        }
    }
};
