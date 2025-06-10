const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show information about the currently playing song'),

  async execute(interaction, bot) {
    const queue = bot.getQueue(interaction.guildId);

    if (!queue || !queue.currentSong) {
      return await interaction.reply({
        content: '❌ No music is currently playing!',
        ephemeral: true
      });
    }

    const song = queue.currentSong;
    const status = queue.isPaused ? '⏸️ Paused' : '▶️ Playing';

    const embed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle(`${status} - Now Playing`)
      .setDescription(`**${song.title}**`)
      .addFields(
        { name: '🎤 Channel', value: song.channel || 'Unknown', inline: true },
        { name: '⏱️ Duration', value: song.duration || 'Unknown', inline: true },
        { name: '👤 Requested by', value: song.requestedBy.toString(), inline: true },
        { name: '🔊 Volume', value: `${queue.volume}%`, inline: true }
      )
      .setThumbnail(song.thumbnail || null)
      .setURL(song.url)
      .setTimestamp();

    if (queue.loop) embed.addFields({ name: '🔂', value: 'Single Loop ON', inline: true });
    if (queue.loopQueue) embed.addFields({ name: '🔁', value: 'Queue Loop ON', inline: true });
    if (queue.songs.length > 0) {
      embed.addFields({ name: '📋 Queue', value: `${queue.songs.length} song(s) remaining`, inline: true });
    }

    await interaction.reply({ embeds: [embed] });
  }
};
