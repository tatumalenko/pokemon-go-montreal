const welcome = guild => ({
    embed: {
        description:
          '**Professor Willow here!** Ready to help!\n\n' +

          'To get some cool wild spawn alerts for specific Pokemon within the neighbourhoods ' +
          `you choose, head over to ${guild.getChannelAlert()} and let ${guild.getBotAlert()} ` +
          'assist you by typing `!want help` there!\n\n' +

          'To get some info and stats on Pokemon including IVs, ATK/DEF/STA, and much more, ' +
          `head over to ${guild.getChannelPokedex()} and let ${guild.getBotPokedex()} ` +
          'assist you by typing `!pd help` there!\n\n' +

          'For any other questions or help, don\'t be shy to ask one of the admin or mod staff, they would be delighted to answer any questions!',
    },
});

module.exports = {
    welcome,
};
