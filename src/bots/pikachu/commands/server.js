// process.on('unhandledRejection', console.error); // Nodejs config to better trace unhandled promise rejections

module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'server',
            enabled: true,
            runIn: [],
            cooldown: 0,
            aliases: ['bots'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            console.log(this.name);
            if (!msg.member.roles.some(role => role.name === 'admin' || role.name === 'mod' || role.name === 'mega-bot')) {
                await msg.channel.send('You do not have permission for this command! You n\'avez pas la permissions d\'utiliser cette commande!');
                return;
            }
            // '!server exit pikachu'
            if (args.length === 2 && (args[0].toLowerCase() === 'restart') && (args[1].toLowerCase() === process.env.name)) {
                await msg.channel.send('Got it! Restarting now...');
                process.exit(1);
            }
            return;
        } catch (e) {
            console.error(`${process.env.name}.${this.name}: \n${e}`);
            if (e.message) { await msg.guild.channels.find('name', this.client.configs.channels.botLogs).send(`${process.env.name}.${this.name}: ${e.message}`); }
        }
    }
};
