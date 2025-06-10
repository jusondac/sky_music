const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available music commands'),

  async execute(interaction, bot) {
    const embed = new EmbedBuilder()
      .setColor('#4A90E2')
      .setTitle('🎵 Sky Music Bot - Commands')
      .setDescription('Here are all the available music commands:')
      .addFields(
        {
          name: '🎵 Music Playback',
          value: [
            '`/play <song>` - Play a song from YouTube',
            '`/pause` - Pause the current song',
            '`/resume` - Resume the paused song',
            '`/stop` - Stop music and clear queue',
            '`/skip` - Skip the current song'
          ].join('\n'),
          inline: false
        },
        {
          name: '📋 Queue Management',
          value: [
            '`/queue` - Show the current queue',
            '`/shuffle` - Shuffle the queue',
            '`/loop` - Toggle single song loop',
            '`/nowplaying` - Show current song info'
          ].join('\n'),
          inline: false
        },
        {
          name: '⚙️ Settings & Info',
          value: [
            '`/volume <0-100>` - Change volume',
            '`/lyrics [song]` - Get lyrics for current or specified song',
            '`/help` - Show this help message'
          ].join('\n'),
          inline: false
        },
        {
          name: '📝 Features',
          value: [
            '🎵 YouTube search and URL support',
            '📝 Automatic lyrics display with song sync',
            '🔄 Loop modes (single song)',
            '🔀 Queue shuffling',
            '🎚️ Volume control',
            '📋 Comprehensive queue management'
          ].join('\n'),
          inline: false
        }
      )
      .setFooter({ text: 'Sky Music Bot | Powered by YouTube & Genius' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
