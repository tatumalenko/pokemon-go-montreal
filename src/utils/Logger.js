class Logger {
    constructor(client) {
        this.client = client;
    }

    /**
     * Logs a message to the configured channel and on the server.
     * @param {string} message
     */
    async logInfo(message) {
        console.log(message);

        const channel = this.client.configs.channels.botLogs;
        await this.logToChannel(channel, message);
    }

    /**
     * Logs an error message to the configured channel and on the server.
     * @param {string} message
     */
    async logError(message) {
        console.error(message);

        const channel = this.client.configs.channels.errorLogs;
        await this.logToChannel(channel, message);
    }

    /**
     * Logs a message to the given channel.
     * @param {string} channel
     * @param {string} message
     */
    async logToChannel(channel, message) {
        const dateString = new Date().toLocaleString();

        // If 'message' is not a string, we assume it's an error object...
        if (typeof message !== 'string') {
            // eslint-disable-next-line
            message = message.message;
        }

        const log = `**[${dateString}]** [${this.client.name}] ${message}`;

        await this.client.guilds.get(this.client.configs.guildId).channels.find('name', channel).send(log);
    }
}

module.exports = Logger;
