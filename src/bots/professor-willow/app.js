const { Client } = require('../../models/Client');
const Discord = require('discord.js');
const configs = require('../../../configs/configs');

new Client({
    clientOptions: {
        fetchAllMembers: true,
    },
    name: 'professor-willow',
    appDirName: __dirname,
    runIn: process.env.runIn ? process.env.runIn : ['all'], // = ['all'] for any channel
}).login();

const TwitterPackage = require('twitter');
const Twitter = new TwitterPackage(configs['professor-willow']);
const wh = new Discord.WebhookClient(configs['professor-willow'].webhookId, configs['professor-willow'].webhookToken);
const colors = ['#7f0000', '#535900', '#40d9ff', '#8c7399', '#d97b6c', '#f2ff40', '#8fb6bf', '#502d59', '#66504d',
    '#89b359', '#00aaff', '#d600e6', '#401100', '#44ff00', '#1a2b33', '#ff00aa', '#ff8c40', '#17330d',
    '#0066bf', '#33001b', '#b39886', '#bfffd0', '#163a59', '#8c235b', '#8c5e00', '#00733d', '#000c59',
    '#ffbfd9', '#4c3300', '#36d98d', '#3d3df2', '#590018', '#f2c200', '#264d40', '#c8bfff', '#f23d6d',
    '#d9c36c', '#2db3aa', '#b380ff', '#ff0022', '#333226', '#005c73', '#7c29a6',
];

Twitter.stream('statuses/filter', {
    follow: configs['professor-willow'].userIds.join(', '),
}, (stream) => {
    console.log('-----------------------------------------------------------------');
    console.log('Twitter bot, Ready to serve');
    console.log('-----------------------------------------------------------------');

    stream.on('data', async (tweet) => {
        try {
            if (!configs['professor-willow'].userIds.includes(tweet.user.id_str)
                || tweet.retweeted_status
                || tweet.in_reply_to_user_id_str
                || tweet.in_reply_to_status_id_str) return;

            let mediaUrl;
            if (Object.prototype.hasOwnProperty.call(tweet.entities, 'media')) {
                tweet.entities.media.forEach((media) => {
                    if (media.type === 'photo') { mediaUrl = media.media_url; }
                });
            }

            const data = {
                title: 'Click here to see the tweet!',
                description: tweet.text,
                timestamp: new Date(),
                url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, // eslint-disable-next-line
                color: parseInt(colors[(Math.random() * colors.length) | 0].replace('#', ''), 16).toString(10),
                image: {
                    url: mediaUrl,
                },
                author: {
                    name: tweet.user.screen_name,
                    icon_url: tweet.user.profile_image_url,
                },
            };

            const embed = new Discord.RichEmbed(data);
            await wh.send(`${tweet.user.screen_name} Tweeted!`, embed);
        } catch (e) {
            console.error(e);
        }
    });

    stream.on('error', (error) => {
        console.log(error);
    });
});