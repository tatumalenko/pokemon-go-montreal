const Discord = require('discord.js');
const settings = require('./auth.json');
const ProfessorWillow = require('./src/ProfessorWillow');

const client = new Discord.Client();
const professor = new ProfessorWillow(client);

client.on('ready', () => console.log('I\'m ready!'));

client.login(settings.token);
