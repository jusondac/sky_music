const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear the entire queue'),

  async execute(interaction, bot) {
    const queue = bot.getQueue(interaction.guildId);

    if (!queue || queue.songs.length === 0) {
      return await interaction.reply({
        content: '❌ The queue is already empty!',
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

    const clearedCount = queue.songs.length;
    queue.songs = [];

    await interaction.reply(`🗑️ Cleared **${clearedCount}** song${clearedCount === 1 ? '' : 's'} from the queue.`);
  }
};
