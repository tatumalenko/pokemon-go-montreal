const TwitterPackage = require('twitter');
const Discord = require('discord.js');
const secrets = require('./secrets2.json');

const Twitter = new TwitterPackage(secrets.twitter);
const wh = new Discord.WebhookClient(secrets.discord.webhook_id, secrets.discord.webhook_token);

const TWITTER_USER_IDS = ['2839430431', '783281708137324549', '4840958511', '849344094681870336', '816666530318524416'];

const colors = ['#7f0000', '#535900', '#40d9ff', '#8c7399', '#d97b6c', '#f2ff40', '#8fb6bf', '#502d59', '#66504d',
    '#89b359', '#00aaff', '#d600e6', '#401100', '#44ff00', '#1a2b33', '#ff00aa', '#ff8c40', '#17330d',
    '#0066bf', '#33001b', '#b39886', '#bfffd0', '#163a59', '#8c235b', '#8c5e00', '#00733d', '#000c59',
    '#ffbfd9', '#4c3300', '#36d98d', '#3d3df2', '#590018', '#f2c200', '#264d40', '#c8bfff', '#f23d6d',
    '#d9c36c', '#2db3aa', '#b380ff', '#ff0022', '#333226', '#005c73', '#7c29a6'
];

Twitter.stream('statuses/filter', {
    follow: TWITTER_USER_IDS.join(', ')
}, (stream) => {
    stream.on('data', async(tweet) => {
        try {
            if (!TWITTER_USER_IDS.includes(tweet.user.id_str) ||
                tweet.retweeted_status ||
                tweet.in_reply_to_user_id_str ||
                tweet.in_reply_to_status_id_str) return;

            let media_url;
            if (tweet.entities.hasOwnProperty('media'))
                for (const media of tweet.entities.media)
                    if (media.type == 'photo')
                        media_url = media.media_url;

            const data = {
                title: 'Click here to see the tweet!',
                description: tweet.text,
                timestamp: new Date(),
                url: 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str,
                color: parseInt(colors[(Math.random() * colors.length) | 0].replace('#', ''), 16).toString(10),
                image: {
                    url: media_url
                },
                author: {
                    name: tweet.user.screen_name,
                    icon_url: tweet.user.profile_image_url
                }
            };

            const embed = new Discord.RichEmbed(data);

            await wh.send(tweet.user.screen_name + ' Tweeted!', embed);
        } catch (e) {
            console.error(e);
        }
    });

    stream.on('error', (error) => {
        console.log(error);
    });
});