const Discord = require('discord.js');

class DiscordUtils {
    constructor() {

    }

    hasRole(member, roleName) {
        return member.roles.some((role) => roleName.toLowerCase() === role.name);
    }

    async sendEmbedToRepicients(recipients, {
        content,
        embed,
    }) {
        let totalAlertsSent = 0;
        const successAlertRecipients = [];
        const failedAlertRecipients = [];

        for (const recipient of recipients) {
            try {
                await recipient.send(content, embed);
                totalAlertsSent++;
                successAlertRecipients.push(recipient.displayName !== undefined ? recipient.displayName : recipient.name);
            } catch (err) {
                if (!failedAlertRecipients.length)
                    {failedAlertRecipients.push('\nERROR: \n');}
                failedAlertRecipients.push(`(CODE ${  err.code  }) ${  recipient instanceof Discord.GuildMember ? recipient.displayName : recipient.name  }\n`);
                console.log(err.stack);
            }
        }
        console.log(`${content  }\nAlerts sent: ${  totalAlertsSent  } (${  successAlertRecipients.join(', ')  })`);
        console.log('-----------------------------------------------------------------');
    }
}

module.exports = DiscordUtils;
