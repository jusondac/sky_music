const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playing music and clear the queue'),

  async execute(interaction, bot) {
    const queue = bot.getQueue(interaction.guildId);

    if (!queue) {
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

    queue.stop();
    bot.deleteQueue(interaction.guildId);

    await interaction.reply('⏹️ Music stopped and queue cleared. Goodbye! 👋');
  }
};
