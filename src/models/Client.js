const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

const Utils = require('../utils/Utils');
const SpellChecker = require('../utils/SpellChecker');
const UserRepository = require('../repositories/UserRepository');
const RaidRepository = require('../repositories/RaidRepository');
const GymRepository = require('../repositories/GymRepository');
const NeighbourhoodRepository = require('../repositories/NeighbourhoodRepository');

const configs = require('../../configs/configs.js');

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    console.log('Exiting bot with status code 1.');
    process.exit(1);
});

class Client extends Discord.Client {
    constructor(options) {
        super(options.clientOptions);
        this.configs = configs;
        this.configs.appDirName = options.appDirName;
        this.configs.moduleDirNames = ['commands', 'events', 'monitors'];
        this.configs.runIn = options.runIn;
        this.name = options.name;
        this.userRepository = new UserRepository(this.configs.dbMongo.dbPath);
        this.raidRepository = new RaidRepository(this.configs.dbMongo.dbPath);
        this.gymRepository = new GymRepository(this.configs.dbMongo.dbPath);
        this.neighbourhoodRepository = new NeighbourhoodRepository(this.configs.polygonMapPath);
        this.utils = Utils;
        this.spellchecker = new SpellChecker([...Utils.getPokemonNames(), ...Utils.getPokemonNames('french'), Utils.getNeighbourhoodNames()], { returnType: 'all-matches', thresholdType: 'similarity', threshold: 0.55 });

        this.on('ready', this.ready); // Runs dynamic import of module files inside folders in `rootDirName`
        this.on('message', this.message); // Runs the on message event listener
        this.on('guildMemberAdd', this.guildMemberAdd);
        this.on('guildMemberRemove', this.guildMemberRemove);
    }

    async ready() {
        try {
            const getDirPaths = (appDirName) => {
                const dirContents = fs.readdirSync(path.join(appDirName));
                const paths = dirContents.map(content => path.join(appDirName, content));
                const that = {};

                const dirPaths = paths.filter(p =>
                    fs.statSync(p).isDirectory() && this.configs.moduleDirNames.includes(path.basename(p)));

                dirPaths.forEach((dirPath) => {
                    const dirName = path.basename(dirPath);
                    const fileNames = fs.readdirSync(dirPath)
                        .filter(dirContent => fs.statSync(path.join(dirPath, dirContent)).isFile() && path.extname(path.join(dirPath, dirContent)) === '.js')
                        .map(jsFile => path.join(dirPath, jsFile));
                    that[dirName] = fileNames;
                });

                return that;
            };

            const getModuleConstructors = (appDirName) => {
                const thos = {};
                const that = getDirPaths(appDirName);

                Object.keys(that).forEach((key) => {
                    thos[key] = {};
                    that[key].forEach((filePath) => {
                        thos[key][path.basename(filePath).replace('.js', '')] = require(filePath);
                    });
                });

                return thos;
            };

            const generateClassInstances = (appDirName) => {
                const thos = {};
                const that = getModuleConstructors(appDirName);

                Object.keys(that).forEach((key) => {
                    thos[key] = {};
                    Object.keys(that[key]).forEach((keyy) => {
                        thos[key][keyy] = new that[key][keyy]();
                    });
                });

                return thos;
            };

            const that = generateClassInstances(this.configs.appDirName);
            this.configs.moduleDirNames.forEach((moduleDirName) => {
                this[moduleDirName] = that[moduleDirName];
            });

            console.log('-----------------------------------------------------------------');
            console.log(`${this.user.tag}, Ready to serve ${this.guilds.size} guilds and ${this.users.size} users`);
            console.log('-----------------------------------------------------------------');
        } catch (err) {
            console.log(err);
        }
    }

    async message(msg) {
        try {
            // Check
            const { prefix } = Utils.parseMessageForCommand(msg);
            const commandPredicate = this.configs.cmdPrefix === prefix;
            if (commandPredicate) { await this.commandMessage(msg); }

            // Check monitor runIn values if not empty

            const monitorPredicate = Object.keys(this.monitors).some(key => this.monitors[key].runIn.includes(msg.channel.name));
            if (monitorPredicate) { await this.monitorMessage(msg); }
        } catch (err) { console.log(err); }
    }

    async commandMessage(msg) {
        try {
            const { prefix, cmd, args } = Utils.parseMessageForCommand(msg);

            // COMMMANDS LOOP CHECK
            Object.keys(this.commands).forEach(async (command) => {
                // Check `cmd` is a valid `command.name` or `command.aliases`
                if (this.commands[command].name === cmd
                || this.commands[command].aliases.includes(cmd)) {
                    // Check `command.enabled` is `true`
                    if (!this.commands[command].enabled) { return; }
                    // Check if `command.runIn` is empty (else use `client.runIn`)
                    if (this.commands[command].runIn.length !== 0) { // `command.runIn = []`?
                        if (!this.commands[command].runIn.includes(msg.channel.name)
                        && !this.commands[command].runIn.includes(msg.channel.type)
                        && !this.commands[command].runIn.includes('all') // `command.runIn[i] == 'all'`
                        ) { return; }
                    } else { // Check `client.runIn` values to make sure bot can run in these channels
                        // eslint-disable-next-line
                        if (!this.configs.runIn.includes(msg.channel.name) // `client.runIn[i] == msg.channel.name`
                        && !this.configs.runIn.includes(msg.channel.type) // `client.runIn[i] == 'dm'`
                        && !this.configs.runIn.includes('all') // `client.runIn[i] == 'all'`
                        ) { return; }
                    }
                    // Pass `client` into `command` instance as property
                    this.commands[command].client = this;
                    // Call `command.run()` method
                    await this.commands[command].run(msg, { prefix, cmd, args });
                }
            });
        } catch (err) { console.log(err); }
    }

    async monitorMessage(msg) {
        try {
            // NON-COMMAND BASED EVENT (MONITOR) (discord-income/raid-income) LOOP CHECK
            Object.keys(this.monitors).forEach(async (monitor) => {
                // Check `monitor.enabled` is `true`
                if (!this.monitors[monitor].enabled) { return; }
                // Check if `monitor.runIn` is empty
                if (this.monitors[monitor].runIn.length !== 0) {
                    if (this.monitors[monitor].runIn.includes(msg.channel.name)
                    || this.monitors[monitor].runIn.includes(msg.channel.type)
                    || this.monitors[monitor].runIn.includes('all')) {
                        // Pass `client` into `monitor` instance as property
                        this.monitors[monitor].client = this;
                        // Call `monitor.run()` method
                        await this.monitors[monitor].run(msg, {});
                    }
                }
            });
        } catch (err) { console.log(err); }
    }

    async guildMemberAdd(member) {
        try {
            // Check for `this.events` which has a property called `eventName = 'guildMemberAdd'`
            Object.keys(this.events).forEach(async (event) => {
            // Check `event.enabled` is `true`
                if (!this.events[event].enabled) { return; }
                // Check for `this.events` has property `eventName = 'guildMemberAdd'`
                if (this.events[event].eventName === 'guildMemberAdd') {
                // Pass `client` into `event` instance as property
                    this.events[event].client = this;
                    // Call `event.run()` method
                    await this.events[event].run(member, {});
                }
            });
        } catch (err) { console.log(err); }
    }

    async guildMemberRemove(member) {
        try {
            // Check for `this.events` which has a property called `eventName = 'guildMemberRemove'`
            Object.keys(this.events).forEach(async (event) => {
            // Check `event.enabled` is `true`
                if (!this.events[event].enabled) { return; }
                // Check for `this.events` has property `eventName = 'guildMemberRemove'`
                if (this.events[event].eventName === 'guildMemberRemove') {
                // Pass `client` into `event` instance as property
                    this.events[event].client = this;
                    // Call `event.run()` method
                    await this.events[event].run(member, {});
                }
            });
        } catch (err) { console.log(err); }
    }

    async login() {
        return super.login(`${this.configs[this.name].botToken}`);
    }
}

module.exports = { Client };
