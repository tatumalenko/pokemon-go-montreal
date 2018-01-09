const GuildManager = require('../../assets/guild/GuildManager');
const { welcome } = require('./messages');

class ProfessorWillow {
    /**
     * @param {Discord.Client} DiscordClient
     */
    constructor(DiscordClient) {
        this.client = DiscordClient;
        this.guildManager = new GuildManager(this.client);

        this.client.on('message', message => this.onClientMessage(message));
    }

    /**
     * @param  {Object} message
     */
    onClientMessage(message) {
        // DEV ONLY
        if (message.channel.type !== 'dm') {
            return;
        }

        this.handleHelp(message);
    }

    /**
     * @param  {Object} message
     */
    handleHelp(message) {
        const authorizedHelpMessages = ['help', '!help', '/help'];

        if (authorizedHelpMessages.indexOf(message.content) !== -1) {
            message.channel.send(welcome(this.guildManager));
        }
    }
}

module.exports = ProfessorWillow;
