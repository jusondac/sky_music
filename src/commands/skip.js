const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song'),

  async execute(interaction, bot) {
    const queue = bot.getQueue(interaction.guildId);

    if (!queue || !queue.currentSong) {
      return await interaction.reply({
        content: '❌ No music is currently playing!',
        ephemeral: true
      });
    }

    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel || voiceChannel.id !== queue.voiceChannel.id) {
      return await interaction.reply({
        content: '❌ You need to be in the same voice channel as the bot!',
        ephemeral: true
      });
    }

    const skippedSong = queue.currentSong.title;

    if (queue.skip()) {
      await interaction.reply(`⏭️ Skipped **${skippedSong}**`);
    } else {
      await interaction.reply({
        content: '❌ Failed to skip the song!',
        ephemeral: true
      });
    }
  }
};
