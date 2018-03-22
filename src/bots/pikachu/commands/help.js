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
            const examples = `
            \`\`\`md
            # -------------------------
            # PIKACHU QUICK HELP GUIDE
            # -------------------------
              [Command](Description):
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~
            [!want](display all current wild preferences)
            [!want on](turn on wild alerts)
            [!want off](turn off wild alerts)
            [!want <pokemon> <neighbourhood> <min level> <min iv>](add wild preference)
            [!want all everywhere 100](add 'all' Pokemon and 'everywhere' for neighbourhood)
            [!want blissey chansey snorlax rosemont 80](add multiple Pokemon)
            [!want all rosemont downtown 25 90](add multiple neighbourhoods)
            [!unwant all rosemont downtown 25 90](remove specific preference)
            [!unwant all](remove every preference with 'all' as Pokemon)
            [!locations](display all current default locations)
            [!locations rosemont downtown](set default locations to two neighbourhoods)
            [!map](display all avail. neighbourhoods and link to new neighbourhood map)
            [!map r](display all avail. neighbourhoods starting in letter 'r')
            [!translate poussifeu](display the translated FR-EN or EN-FR Pokemon name)
            [!spell blissay](display all likely words you meant - either name or neighbourhood)
            \`\`\``;
            const mapLink = 'https://drive.google.com/open?id=1HeJJCUg7MdazGHeUU1-e3txsMjXreJdN';
            const docLink = 'https://github.com/tatumalenko/pokemon-go-montreal/tree/master/src/bots/pikachu';
            await msg.channel.send(`Detailed instructions: <${docLink}>
                Map: <${mapLink}>
                ${examples}
                `);
        } catch (e) {
            await msg.channel.send(e.message);
            console.log(e);
        }
    }
};
