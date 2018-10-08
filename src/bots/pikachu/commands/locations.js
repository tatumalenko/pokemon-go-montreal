module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'locations',
            enabled: true,
            runIn: [], // [] = uses app.js runIn property values
            aliases: ['location', 'mylocations', 'home', 'default', 'favorites'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            const user = await this.client.userRepository.fetchUser(msg.author);

            // e.g.: '!location' or '!locations'
            if (args.length === 0) {
                await msg.channel.send(`**${user.name}\nLocation(s): ** ${user.locations.length === 0 ? ' *none set/aucuns établis*' : user.locations.join(', ')}`);
                return;
            }

            // e.g.: '!location plateau, ville-marie'
            try {
                if (!args) {
                    throw new Error(this.client.utils.createErrorMsg({
                        english: 'Oops! The entries are not valid neighbourhood names.',
                        french: 'Oops! Les entrées ne sont pas des noms de quartiers valides!',
                    }));
                }
                const locations = args.join(' ')
                    .match(/(?:\w|['-]\w)+/ig)
                    .filter(l => !Number(l))
                    .map(e => this.client.utils.getNeighbourhoodAlias(e))
                    .sort();
                console.log(locations);
                user.locations = locations;
                await user.save();
                await msg.react('✅');
            } catch (e) {
                const userEntries = args.join(' ')
                    .match(/(?:\w|['-]\w)+/ig)
                    .filter(l => !Number(l));
                await msg.react('❌');
                if (e.message.includes('is not a valid enum value')) {
                    console.log(e.message);
                    const badEntry = /`(\w+[-\w+])` is not a valid enum/i.exec(e.message);
                    if (badEntry) {
                        await msg.channel.send(this.client.utils.createErrorMsg({
                            english: `Oops! \`${badEntry[1]}\` is not a valid neighbourhood name.`,
                            french: `Oops! \`${badEntry[1]}\` n'est pas un nom de quartier valide!`,
                        }));
                    }
                } else if (e.message.includes('User validation failed: locations')) {
                    console.log(e.message);
                    const badEntries = e.message.match(/(\d+)/g).map(idx => userEntries[idx]).join(', ');
                    if (badEntries) {
                        await msg.channel.send(this.client.utils.createErrorMsg({
                            english: `Oops! \`${badEntries}\` are not valid neighbourhood names.`,
                            french: `Oops! \`${badEntries}\` ne sont pas des noms de quartiers valides.`,
                        }));
                    }
                } else if (e instanceof Error) {
                    await msg.channel.send(e.message);
                }

                console.log(e.message);
            }
        } catch (e) {
            console.error(e);
            await msg.channel.send(e.message);
            await this.client.logger.logInfo(`${process.env.name}.${this.name}: ${e.message}`);
        }
    }
};
