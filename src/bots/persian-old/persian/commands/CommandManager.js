const GetRaidsCommand = require("./GetRaidsCommand.js");
//const GetAllRaidsCommand = require("./GetAllRaidsCommand.js"); TODO

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
                console.log("User: '" + discordMessage.author.username + "' Command: '" + discordMessage.content + "'");
                if (commandArgs[1] === "all") {
                    return new GetAllRaidsCommand(discordMessage, commandArgs);
                }
                return new GetRaidsCommand(discordMessage, commandArgs);
            default:
                return null;
        }
        
    }
}

module.exports = CommandManager;