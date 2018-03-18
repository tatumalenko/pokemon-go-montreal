const fs = require("fs");

class ConfigManager {
    static GetSecrets() {
        var secretsString = fs.readFileSync(__dirname + "/../secrets.json");
        var secrets = JSON.parse(secretsString);
        return secrets;
    }

    static GetConfigs() {
        var configsString = fs.readFileSync(__dirname + "/../configs.json");
        var configs = JSON.parse(configsString);
        return configs;
    }
}

module.exports = ConfigManager;