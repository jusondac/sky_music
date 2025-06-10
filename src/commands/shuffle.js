const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the current queue'),

  async execute(interaction, bot) {
    const queue = bot.getQueue(interaction.guildId);

    if (!queue || queue.songs.length === 0) {
      return await interaction.reply({
        content: '❌ The queue is empty!',
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

    if (queue.songs.length < 2) {
      return await interaction.reply({
        content: '❌ Need at least 2 songs in queue to shuffle!',
        ephemeral: true
      });
    }

    queue.shuffle();
    await interaction.reply(`🔀 Shuffled **${queue.songs.length}** songs in the queue!`);
  }
};
