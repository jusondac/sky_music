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

    // Simple guild check
    if (!interaction.guildId) {
      return await interaction.reply({
        content: '❌ This command can only be used in a server!',
        flags: MessageFlags.Ephemeral
      });
    }

    // Debug guild information
    console.log('🔍 Guild debug:', {
      hasGuild: !!interaction.guild,
      guildId: interaction.guildId,
      cachedGuilds: bot.client.guilds.cache.size,
      cachedGuildIds: Array.from(bot.client.guilds.cache.keys()),
      guildInCache: bot.client.guilds.cache.has(interaction.guildId)
    });

    // Use interaction.guild if available, otherwise try to get from cache
    let guild = interaction.guild;
    if (!guild) {
      guild = bot.client.guilds.cache.get(interaction.guildId);
    }

    // If still no guild, try to fetch it
    if (!guild) {
      try {
        guild = await bot.client.guilds.fetch(interaction.guildId);
        console.log('✅ Successfully fetched guild:', guild.name);
      } catch (error) {
        console.error('❌ Failed to fetch guild:', error);
        return await interaction.reply({
          content: `❌ Bot cannot access this server. Please make sure the bot has been properly invited with the correct permissions.\n\nUse \`/botinfo\` to check bot status.`,
          flags: MessageFlags.Ephemeral
        });
      }
    }

    try {
      // Try multiple ways to get voice state information
      const member = await guild.members.fetch(interaction.user.id);
      const voiceState = guild.voiceStates.cache.get(interaction.user.id);

      // Debug logging to understand voice state
      console.log('🔍 Voice state debug:', {
        memberHasVoice: !!member.voice,
        memberChannelId: member.voice?.channelId,
        voiceStateExists: !!voiceState,
        voiceStateChannelId: voiceState?.channelId,
        voiceStateChannelName: voiceState?.channel?.name
      });

      // Check voice channel using voice states cache
      const voiceChannel = voiceState?.channel || member.voice?.channel;

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

      const errorMessage = `❌ Error: ${error.message}`;

      if (interaction.deferred) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({
          content: errorMessage,
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
};
