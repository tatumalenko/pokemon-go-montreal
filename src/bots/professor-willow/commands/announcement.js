module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'announcement',
            enabled: true,
            runIn: ['announcement-post'], // [] = uses app.js runIn property values
            aliases: ['announcements', 'announce'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            if (!msg.channel.permissionsFor(msg.author).has('ADMINISTRATOR')) return;

            args = args.join(' ').split(' | ');
            const embed = {};
            let content;
            let channelDestination;
            for (let i = 0; i < args.length - 1; i += 2) {
                switch (args[i]) {
                    case 'content':
                        content = args[i + 1];
                        break;
                    case 'channel':
                        channelDestination = msg.guild.channels.find('name', args[i + 1]);
                        break;
                    case 'msg':
                        embed.description = args[i + 1].replace(/\\n/g, '\n');
                        break;
                    case 'title':
                        embed.title = args[i + 1];
                        break;
                    case 'url':
                        embed.url = args[i + 1];
                        break;
                    case 'image':
                        embed.image = {
                            url: args[i + 1],
                        };
                        break;
                    default:
                        break;
                }
            }

            if (Object.keys(embed).length !== 0) { embed.color = '15588666'; }

            if (!channelDestination) channelDestination = msg.channel;

            console.log(content, embed);

            if (!!content && Object.keys(embed).length !== 0) {
                await channelDestination.send(content, { embed });
            } else if (content && Object.keys(embed).length === 0) {
                await channelDestination.send(content);
            } else if (!content && Object.keys(embed).length !== 0) {
                await channelDestination.send({
                    embed,
                });
            }
        } catch (e) {
            console.error(e);
        }
    }
};
