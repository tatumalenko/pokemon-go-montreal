module.exports = class {
    constructor(...params) {
        Object.assign(this, {
            name: 'cost',
            enabled: true,
            runIn: ['test-zone'],
            cooldown: 0,
            aliases: ['cout', 'costs', 'couts'],
            description: '',
        });
    }

    async run(msg, { prefix, cmd, args }) {
        try {
            console.log(`Cost command! Number of args: ${args.length}`);
            const lvs = [];
            for (let i = 1; i <= 40.5; i += 0.5) { lvs.push(i); }

            if (args.length !== 2) throw new Error('Wrong number of arguments.');

            if (args.some(arg => !Number.isFinite(Number(arg)))) throw new Error('Arguments are not numbers.');

            if (args.some(arg => arg < 1 || arg > 40)
                || !lvs.some(lv => lv === Number(args[0]))
                || !lvs.some(lv => lv === Number(args[1]))) throw new Error('Levels out of range.');

            if (parseFloat(args[0]) >= parseFloat(args[1])) throw new Error(`First argument (${args[0]}) should be smaller than the second one (${args[1]}).`);

            const cost = powerUpCost(parseFloat(args[0]), parseFloat(args[1]));

            await msg.channel.send({
                embed: {
                    title: 'Level Up Costs',
                    description: `**Start**: \`${args[0]}\`\n`
                        + `**End**: \`${args[1]}\`\n`
                        + `<:stardust:383911374532902912>: \`${cost.stardust.toLocaleString('en')}\`\n`
                        + `<:rarecandy:383911406434516994>: \`${cost.candies}\``,
                },
            });
        } catch (e) {
            console.error(`${process.env.name}.${this.name}: \n${e}`);
            if (e.message) {
                await msg.guild.channels.find('name', this.client.configs.channels.botLogs).send(`${process.env.name}.${this.name}: ${e.message}`);
                await msg.channel.send(`${process.env.name}.${this.name}: ${e.message}`);
            }
        }
    }
};

function powerUpCost(startLevel, endLevel) {
    const sd = [];
    const lv = [];
    const c = [];
    const sdCum = [];
    const cCum = [];
    let j = 0;
    const stardust = {};
    const candies = {};

    for (let i = 1; i < 41; i += 0.5) {
        lv.push(i + 0.5);

        if (i < 3) {
            sd.push(200);
            c.push(1);
        } else if (i < 5) {
            sd.push(400);
            c.push(1);
        } else if (i < 7) {
            sd.push(600);
            c.push(1);
        } else if (i < 9) {
            sd.push(800);
            c.push(1);
        } else if (i < 11) {
            sd.push(1000);
            c.push(1);
        } else if (i < 13) {
            sd.push(1300);
            c.push(2);
        } else if (i < 15) {
            sd.push(1600);
            c.push(2);
        } else if (i < 17) {
            sd.push(1900);
            c.push(2);
        } else if (i < 19) {
            sd.push(2200);
            c.push(2);
        } else if (i < 21) {
            sd.push(2500);
            c.push(2);
        } else if (i < 23) {
            sd.push(3000);
            c.push(3);
        } else if (i < 25) {
            sd.push(3500);
            c.push(3);
        } else if (i < 26) {
            sd.push(4000);
            c.push(3);
        } else if (i < 27) {
            sd.push(4000);
            c.push(4);
        } else if (i < 29) {
            sd.push(4500);
            c.push(4);
        } else if (i < 31) {
            sd.push(5000);
            c.push(4);
        } else if (i < 33) {
            sd.push(6000);
            c.push(6);
        } else if (i < 35) {
            sd.push(7000);
            c.push(8);
        } else if (i < 37) {
            sd.push(8000);
            c.push(10);
        } else if (i < 39) {
            sd.push(9000);
            c.push(12);
        } else if (i < 41) {
            sd.push(10000);
            c.push(15);
        }

        if (j === 0) {
            sdCum.push(sd[j]);
            cCum.push(c[j]);
        } else {
            sdCum.push(sdCum[j - 1] + sd[j]);
            cCum.push(cCum[j - 1] + c[j]);
        }
        stardust[lv[j]] = sdCum[j];
        candies[lv[j]] = cCum[j];
        j += 1;
    }
    stardust['1'] = 200;
    candies['1'] = 1;
    return {
        stardust: stardust[endLevel] - stardust[startLevel],
        candies: candies[endLevel] - candies[startLevel],
        cumulative: {
            stardust,
            candies,
        },
    };
}

