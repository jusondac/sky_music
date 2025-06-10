const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Song name or YouTube URL to play')
        .setRequired(true)
    ),

  async execute(interaction, bot) {
    const query = interaction.options.getString('query');
    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return await interaction.reply({
        content: '❌ You need to be in a voice channel to play music!',
        flags: MessageFlags.Ephemeral
      });
    }

    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has(['Connect', 'Speak'])) {
      return await interaction.reply({
        content: '❌ I need permissions to connect and speak in your voice channel!',
        flags: MessageFlags.Ephemeral
      });
    }

    await interaction.deferReply();

    try {
      let songInfo;

      // Check if it's a YouTube URL
      if (bot.youtubeService.isValidUrl(query)) {
        songInfo = await bot.youtubeService.getVideoInfo(query);
      } else {
        songInfo = await bot.youtubeService.search(query);
      }

      // Get or create queue
      let queue = bot.getQueue(interaction.guildId);
      if (!queue) {
        queue = bot.createQueue(interaction.guildId, voiceChannel, interaction.channel);
      }

      // Add song to queue
      const addedSong = await queue.addSong(songInfo, member.user);

      // Create response embed
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Added to Queue')
        .setDescription(`**${addedSong.title}**`)
        .addFields(
          { name: '🎤 Channel', value: addedSong.channel || 'Unknown', inline: true },
          { name: '⏱️ Duration', value: addedSong.duration || 'Unknown', inline: true },
          { name: '👤 Requested by', value: member.user.toString(), inline: true }
        )
        .setThumbnail(addedSong.thumbnail || null)
        .setTimestamp();

      if (queue.songs.length > 0 || queue.currentSong) {
        const position = queue.currentSong ? queue.songs.length : 0;
        embed.addFields({ name: '📍 Position in Queue', value: position === 0 ? 'Now Playing' : `${position + 1}`, inline: true });
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Play command error:', error);
      await interaction.editReply({
        content: `❌ Error: ${error.message}`
      });
    }
  }
};
