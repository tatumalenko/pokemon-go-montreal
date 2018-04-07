module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'help',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: ['aide', 'info'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            const examples = '\`\`\`md\n' +
            '# -------------------------\n' +
            '# PIKACHU QUICK HELP GUIDE\n' +
            '# -------------------------\n' +
            '  [Command](Description):\n' +
            '~~~~~~~~~~~~~~~~~~~~~~~~~~~\n' +
            '[!want](display all current wild preferences)\n' +
            '[!want on](turn on wild alerts)\n' +
            '[!want off](turn off wild alerts)\n' +
            '[!want <pokemon> <neighbourhood> <min level> <min iv>](add wild preference)\n' +
            '[!want all everywhere 100](add \'all\' Pokemon and \'everywhere\' for neighbourhood)\n' +
            '[!want blissey chansey snorlax rosemont 80](add multiple Pokemon)\n' +
            '[!want all rosemont downtown 25 90](add multiple neighbourhoods)\n' +
            '[!unwant all rosemont downtown 25 90](remove specific preference)\n' +
            '[!unwant all](remove every preference with \'all\' as Pokemon)\n' +
            '[!locations](display all current default locations)\n' +
            '[!locations rosemont downtown](set default locations to two neighbourhoods)\n' +
            '[!map](display all avail. neighbourhoods and link to new neighbourhood map)\n' +
            '[!map r](display all avail. neighbourhoods starting in letter \'r\')\n' +
            '[!translate poussifeu](display the translated FR-EN or EN-FR Pokemon name)\n' +
            '[!spell blissay](display all likely words you meant)\n' +
            '\`\`\`';
            const mapLink = 'https://drive.google.com/open?id=1HeJJCUg7MdazGHeUU1-e3txsMjXreJdN';
            const docLink = 'https://github.com/tatumalenko/pokemon-go-montreal/tree/master/src/bots/pikachu';
            await msg.channel.send(`**Detailed instructions:** <${docLink}>\n` +
                `**Map:** <${mapLink}>\n` +
                `${examples}`);
        } catch (e) {
            if (e.message) { await msg.channel.send(e.message); }
            console.error(`${process.env.name}.${this.name}: \n${e}`);
            if (e.message) { await msg.guild.channels.find('name', this.client.configs.channels.botLogs).send(`${process.env.name}.${this.name}: ${e.message}`); }
        }
    }
};
