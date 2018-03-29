module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'neighbourhoods',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: ['map', 'quartiers', 'neighbourhood', 'quartier', 'districts', 'areas', 'sectors', 'arrondissements'],
            description: '',
        });
    }

    // eslint-disable-next-line class-methods-use-this
    async run(msg, { prefix, cmd, args }) {
        try {
            if (args.length === 0) {
                const mapLink = 'https://drive.google.com/open?id=1HeJJCUg7MdazGHeUU1-e3txsMjXreJdN';
                await msg.channel.send(`Map: ${mapLink}
                    **Neighbourhoods/Quartiers: ** ${this.client.utils.getNeighbourhoodNames().join(', ')}
                    `);
                return;
            }
            await msg.channel.send(`**Neighbourhoods/Quartiers (${args.join('').charAt(0)}...?): ** ${this.client.utils.getNeighbourhoodNames().filter(n => n.charAt(0) === args.join('').charAt(0)).join(', ')}`);
            return;
        } catch (e) {
            await msg.channel.send(this.client.utils.createErrorMsg({
                english: 'Oops! Something went wrong!',
                french: 'Oops! Quelque chose s\'est mal passé!',
            }));
            console.log(e);
            await msg.guild.channels.find('name', this.client.configs.channels.botLogs).send(e);
        }
    }
};
