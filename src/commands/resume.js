const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song'),

  async execute(interaction, bot) {
    const queue = bot.getQueue(interaction.guildId);

    if (!queue || !queue.isPaused) {
      return await interaction.reply({
        content: '❌ No music is currently paused!',
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

    if (queue.resume()) {
      await interaction.reply('▶️ Music resumed.');
    } else {
      await interaction.reply({
        content: '❌ Music is not paused!',
        ephemeral: true
      });
    }
  }
};
