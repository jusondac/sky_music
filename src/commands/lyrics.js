const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Get lyrics for the current song or search for lyrics')
    .addStringOption(option =>
      option.setName('song')
        .setDescription('Song to search lyrics for (leave empty for current song)')
        .setRequired(false)
    ),

  async execute(interaction, bot) {
    const songQuery = interaction.options.getString('song');
    let searchQuery;

    if (!songQuery) {
      const queue = bot.getQueue(interaction.guildId);
      if (!queue || !queue.currentSong) {
        return await interaction.reply({
          content: '❌ No music is currently playing! Please specify a song to search for.',
          ephemeral: true
        });
      }
      searchQuery = queue.currentSong.title;
    } else {
      searchQuery = songQuery;
    }

    await interaction.deferReply();

    try {
      const lyrics = await bot.lyricsService.getLyrics(searchQuery);

      if (!lyrics || !lyrics.lyrics) {
        return await interaction.editReply({
          content: `❌ No lyrics found for **${searchQuery}**`
        });
      }

      const lyricsChunks = bot.lyricsService.splitLyrics(lyrics.lyrics);

      // Send first chunk
      const embed = new EmbedBuilder()
        .setColor('#9932CC')
        .setTitle('📝 Lyrics')
        .setDescription(`**${lyrics.title}** by **${lyrics.artist}**\n\n${lyricsChunks[0]}`)
        .setThumbnail(lyrics.thumbnail || null)
        .setURL(lyrics.url)
        .setFooter({ text: lyricsChunks.length > 1 ? `Page 1 of ${lyricsChunks.length}` : 'Powered by Genius' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // If there are multiple chunks, send them as follow-ups
      if (lyricsChunks.length > 1) {
        for (let i = 1; i < lyricsChunks.length; i++) {
          setTimeout(async () => {
            const continueEmbed = new EmbedBuilder()
              .setColor('#9932CC')
              .setDescription(lyricsChunks[i])
              .setFooter({ text: `Page ${i + 1} of ${lyricsChunks.length}` });

            await interaction.followUp({ embeds: [continueEmbed] });
          }, i * 2000); // 2 second delay between chunks
        }
      }

    } catch (error) {
      console.error('Lyrics command error:', error);
      await interaction.editReply({
        content: `❌ Error searching for lyrics: ${error.message}`
      });
    }
  }
};
