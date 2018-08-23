module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'clear',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: ['clears', 'delete'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            // Check the following permissions before deleting messages:
            //    1. Check if the user has enough permissions
            //    2. Check if I have the permission to execute the command
            if (!msg.channel.permissionsFor(msg.author).has('MANAGE_MESSAGES')) {
                msg.channel.sendMessage(`Sorry, you don't have the permission to execute the command "${msg.content}"`);
                console.log(`Sorry, you don't have the permission to execute the command "${msg.content}"`);
                return;
            }

            if (!msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) {
                msg.channel.sendMessage(`Sorry, I don't have the permission to execute the command "${msg.content}"`);
                console.log(`Sorry, I don't have the permission to execute the command "${msg.content}"`);
                return;
            }

            // Only delete messages if the channel type is TextChannel
            // DO NOT delete messages in DM Channel or Group DM Channel
            if (msg.channel.type === 'text') {
                msg.channel.fetchMessages()
                    .then((messages) => {
                        if (args[0] !== undefined) {
                            msg.channel.bulkDelete(parseInt(args[0], 10) + 1);
                        } else {
                            msg.channel.send('You need to enter a number following the `!clear` command to indicate how many messages to delete!\n'
                                + 'Example: `!clear 2`');
                        }
                    })
                    .catch((err) => {
                        console.log('Error while doing Bulk Delete');
                        console.log(err);
                    });
            }
        } catch (e) {
            console.error(e);
        }
    }
};
