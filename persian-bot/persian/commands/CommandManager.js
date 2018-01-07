const GetRaidsCommand = require("./GetRaidsCommand.js");

class CommandManager {
    constructor(commandPrefix) {
        this.commandPrefix = commandPrefix;
    }

    GetCommand(discordMessage) {
        if (!discordMessage.content.startsWith(this.commandPrefix)) {
            return null;
        }
        
        var commandText = discordMessage.content.substring(this.commandPrefix.length);
        var commandArgs = commandText.split(" ");
        
        switch(commandArgs[0]) {
            case 'raids':
                return new GetRaidsCommand(discordMessage, commandArgs);
            default:
                return null;
        }
        console.log("User: '" + discordMessage.author.username + "' Command: '" + message.content + "'");
    }
}

module.exports = CommandManager;