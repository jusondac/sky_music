const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, StreamType } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');

class MusicQueue {
  constructor(guildId, voiceChannel, textChannel, bot) {
    this.guildId = guildId;
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.bot = bot;

    this.songs = [];
    this.currentSong = null;
    this.volume = 50;
    this.isPlaying = false;
    this.isPaused = false;
    this.loop = false;
    this.loopQueue = false;

    this.connection = null;
    this.player = null;
    this.currentLyrics = null;
    this.lyricsMessage = null;

    this.setupPlayer();
  }

  setupPlayer() {
    this.player = createAudioPlayer();

    this.player.on(AudioPlayerStatus.Playing, () => {
      this.isPlaying = true;
      this.isPaused = false;
      console.log(`🎵 Now playing: ${this.currentSong?.title}`);
    });

    this.player.on(AudioPlayerStatus.Paused, () => {
      this.isPaused = true;
      console.log('⏸️ Music paused');
    });

    this.player.on(AudioPlayerStatus.Idle, () => {
      this.isPlaying = false;
      this.isPaused = false;

      if (this.currentSong) {
        console.log(`✅ Finished playing: ${this.currentSong.title}`);
        this.handleSongEnd();
      }
    });

    this.player.on('error', (error) => {
      console.error('Audio player error:', error);
      this.textChannel.send('❌ An error occurred while playing the audio.');
      this.playNext();
    });
  }

  async connect() {
    if (this.connection) return this.connection;

    try {
      this.connection = joinVoiceChannel({
        channelId: this.voiceChannel.id,
        guildId: this.guildId,
        adapterCreator: this.voiceChannel.guild.voiceAdapterCreator,
      });

      this.connection.subscribe(this.player);

      this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await Promise.race([
            entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
        } catch (error) {
          this.connection.destroy();
          this.bot.deleteQueue(this.guildId);
        }
      });

      return this.connection;
    } catch (error) {
      console.error('Voice connection error:', error);
      throw new Error('Failed to connect to voice channel');
    }
  }

  async addSong(songInfo, requestedBy) {
    const song = {
      ...songInfo,
      requestedBy: requestedBy,
      addedAt: new Date()
    };

    this.songs.push(song);

    if (!this.isPlaying && !this.currentSong) {
      await this.playNext();
    }

    return song;
  }

  async playNext() {
    if (this.loop && this.currentSong) {
      // Loop current song
      await this.playSong(this.currentSong);
      return;
    }

    if (this.songs.length === 0) {
      if (this.loopQueue && this.currentSong) {
        this.songs.push(this.currentSong);
      } else {
        this.currentSong = null;
        this.isPlaying = false;
        await this.sendNowPlayingEmbed('Queue finished! 🎵');
        return;
      }
    }

    const nextSong = this.songs.shift();
    if (this.loopQueue && this.currentSong) {
      this.songs.push(this.currentSong);
    }

    await this.playSong(nextSong);
  }

  async playSong(song) {
    try {
      this.currentSong = song;

      await this.connect();

      const audioStream = await this.bot.youtubeService.getAudioStream(song.url);
      const resource = createAudioResource(audioStream, {
        inlineVolume: true,
        inputType: StreamType.Arbitrary
      });

      resource.volume?.setVolume(this.volume / 100);
      this.player.play(resource);

      // Send now playing embed with lyrics
      await this.sendNowPlayingEmbed();
      await this.displayLyrics();

    } catch (error) {
      console.error('Play song error:', error);
      await this.textChannel.send(`❌ Error playing **${song.title}**: ${error.message}`);
      await this.playNext();
    }
  }

  async sendNowPlayingEmbed(customMessage = null) {
    if (customMessage) {
      await this.textChannel.send(customMessage);
      return;
    }

    if (!this.currentSong) return;

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎵 Now Playing')
      .setDescription(`**${this.currentSong.title}**`)
      .addFields(
        { name: '🎤 Channel', value: this.currentSong.channel || 'Unknown', inline: true },
        { name: '⏱️ Duration', value: this.currentSong.duration || 'Unknown', inline: true },
        { name: '👤 Requested by', value: this.currentSong.requestedBy.toString(), inline: true }
      )
      .setThumbnail(this.currentSong.thumbnail || null)
      .setTimestamp();

    if (this.loop) embed.addFields({ name: '🔂', value: 'Single Loop ON', inline: true });
    if (this.loopQueue) embed.addFields({ name: '🔁', value: 'Queue Loop ON', inline: true });
    if (this.songs.length > 0) {
      embed.addFields({ name: '📋 Queue', value: `${this.songs.length} song(s) remaining`, inline: true });
    }

    await this.textChannel.send({ embeds: [embed] });
  }

  async displayLyrics() {
    if (!this.currentSong) return;

    try {
      console.log(`🎵 Searching lyrics for: "${this.currentSong.title}"`);
      const lyrics = await this.bot.lyricsService.getLyrics(this.currentSong.title);

      if (!lyrics || !lyrics.lyrics || lyrics.lyrics.trim().length === 0) {
        const noLyricsEmbed = new EmbedBuilder()
          .setColor('#FFFF00')
          .setTitle('📝 Lyrics')
          .setDescription('No lyrics found for this song.')
          .setTimestamp();

        this.lyricsMessage = await this.textChannel.send({ embeds: [noLyricsEmbed] });
        return;
      }

      console.log(`📝 Found lyrics for: "${lyrics.title}" by ${lyrics.artist}`);
      this.currentLyrics = lyrics;
      const lyricsChunks = this.bot.lyricsService.splitLyrics(lyrics.lyrics);

      // Send first chunk
      const embed = new EmbedBuilder()
        .setColor('#9932CC')
        .setTitle('📝 Lyrics')
        .setDescription(`**${lyrics.title}** by **${lyrics.artist}**\n\n${lyricsChunks[0]}`)
        .setThumbnail(lyrics.thumbnail || this.currentSong.thumbnail)
        .setTimestamp();

      // Only add footer if there are multiple chunks
      if (lyricsChunks.length > 1) {
        embed.setFooter({ text: `Page 1 of ${lyricsChunks.length}` });
      }

      this.lyricsMessage = await this.textChannel.send({ embeds: [embed] });

      // If there are multiple chunks, send them with delay
      if (lyricsChunks.length > 1) {
        for (let i = 1; i < lyricsChunks.length; i++) {
          setTimeout(async () => {
            if (this.currentSong && this.isPlaying) {
              const continueEmbed = new EmbedBuilder()
                .setColor('#9932CC')
                .setDescription(lyricsChunks[i])
                .setFooter({ text: `Page ${i + 1} of ${lyricsChunks.length}` });

              await this.textChannel.send({ embeds: [continueEmbed] });
            }
          }, i * 3000); // 3 second delay between chunks
        }
      }

    } catch (error) {
      console.error('Lyrics display error:', error);
      // Don't send error message to user, just log it
    }
  }

  handleSongEnd() {
    this.currentLyrics = null;
    this.lyricsMessage = null;
    setTimeout(() => this.playNext(), 1000);
  }

  pause() {
    if (this.player && this.isPlaying && !this.isPaused) {
      this.player.pause();
      return true;
    }
    return false;
  }

  resume() {
    if (this.player && this.isPaused) {
      this.player.unpause();
      return true;
    }
    return false;
  }

  stop() {
    if (this.player) {
      this.player.stop();
    }
    this.songs = [];
    this.currentSong = null;
    this.currentLyrics = null;
    this.lyricsMessage = null;
  }

  skip() {
    if (this.player && this.isPlaying) {
      this.player.stop();
      return true;
    }
    return false;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(100, volume));
    if (this.player && this.player.state.resource && this.player.state.resource.volume) {
      this.player.state.resource.volume.setVolume(this.volume / 100);
    }
  }

  shuffle() {
    for (let i = this.songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
    }
  }

  getQueue() {
    return {
      current: this.currentSong,
      queue: this.songs,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      volume: this.volume,
      loop: this.loop,
      loopQueue: this.loopQueue
    };
  }

  destroy() {
    this.stop();
    if (this.connection) {
      this.connection.destroy();
    }
    this.songs = [];
    this.currentSong = null;
    this.currentLyrics = null;
    this.lyricsMessage = null;
  }
}

module.exports = MusicQueue;
