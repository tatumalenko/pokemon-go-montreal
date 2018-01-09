const settings = require('./guild.settings.json');

class GuildManager {
    /**
    * @param {Discord.Client} DiscordClient
    */
    constructor(DiscordClient) {
        this.client = DiscordClient;
        this.guild = null;

        this.client.on('ready', () => this.onClientReady());
    }

    onClientReady() {
        this.guild = this.client.guilds.get(settings.id);
    }

    /**
     * @return {Channel}
     */
    getChannelAlert() {
        return this.guild.channels.find('name', settings.channels.alert);
    }

    /**
    * @return {Channel}
    */
    getChannelPokedex() {
        return this.guild.channels.find('name', settings.channels.pokedex);
    }

    /**
     * @return {Member}
     */
    getBotAlert() {
        return this.guild.members.find('id', settings.bots.alert);
    }

    /**
     * @return {Member}
     */
    getBotPokedex() {
        return this.guild.members.find('id', settings.bots.pokedex);
    }
}

module.exports = GuildManager;
