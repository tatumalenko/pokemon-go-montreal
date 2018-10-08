module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'profanites',
            enabled: true,
            runIn: ['show-off', 'rant', 'moderation', 'secret-treehouse', 'super-secret-penthouse', 'bot-testing'], // if = [] -> uses app.js runIn property values
            description: '',
        });
    }

    async run(msg, ...params) {
        try {
            // Only listen to messages not coming from the bot itself
            if (this.client.configs['professor-willow'].clientId !== msg.member.id) {
                const cussWordsFrench = ['shit', 'damn', 'christ', 'jesus'];
                const cussWordsEnglish = ['merde', 'calisse', 'tabarnak', 'esti'];
                const reactions = ['😱', '😤', '😭', '😝', '🥞'];
                const randNumber = Math.random();
                const shouldReply = randNumber > 0.1 && randNumber < 0.4;
                if (!shouldReply) {
                    // Do nothing..
                } else if (cussWordsFrench.some(word => msg.content.toLowerCase().includes(word))) {
                    await msg.react(reactions[Math.floor(Math.random() * cussWordsEnglish.length)]);
                    await msg.channel.send(cussWordsEnglish[Math.floor(Math.random() * cussWordsEnglish.length)]);
                } else if (cussWordsEnglish.some(word => msg.content.toLowerCase().includes(word))) {
                    await msg.react(reactions[Math.floor(Math.random() * cussWordsEnglish.length)]);
                    await msg.channel.send(cussWordsFrench[Math.floor(Math.random() * cussWordsFrench.length)]);
                }
            }
        } catch (e) {
            console.error(e);
            await this.client.logger.logError(`${process.env.name}.${this.name}: ${e.message}`);
        }
    }
};
