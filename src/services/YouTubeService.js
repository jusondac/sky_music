const YTDlpWrap = require('yt-dlp-wrap').default;
const YouTube = require('youtube-sr').default;
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class YouTubeService {
  constructor() {
    this.searchLimit = 1;
    this.ytDlp = new YTDlpWrap();
    this.initializeYtDlp();
  }

  async initializeYtDlp() {
    try {
      // Download yt-dlp binary if not exists
      const ytDlpPath = await this.ytDlp.downloadFromGithub();
      console.log('✅ yt-dlp binary ready at:', ytDlpPath);
    } catch (error) {
      console.warn('⚠️ Could not download yt-dlp binary:', error.message);
      console.log('📥 Attempting to use system yt-dlp...');
    }
  }

  async search(query) {
    try {
      const results = await YouTube.search(query, { limit: this.searchLimit, type: 'video' });

      if (!results || results.length === 0) {
        throw new Error('No results found');
      }

      const video = results[0];

      // Debug logging to check duration values
      console.log(`🔍 Debug - Video duration info:`, {
        title: video.title,
        duration: video.duration,
        durationInSec: video.durationInSec,
        durationMs: video.durationMs
      });

      // Smart duration handling - the duration field contains milliseconds
      let durationInSeconds;
      if (video.duration) {
        // Convert from milliseconds to seconds
        durationInSeconds = Math.floor(video.duration / 1000);
        console.log(`🔧 Converted duration from ${video.duration}ms to ${durationInSeconds}s`);
      } else if (video.durationInSec) {
        durationInSeconds = video.durationInSec;
      } else {
        durationInSeconds = 0;
      }

      return {
        title: video.title,
        url: video.url,
        duration: this.formatDuration(durationInSeconds),
        durationMs: durationInSeconds * 1000,
        thumbnail: video.thumbnail?.url,
        channel: video.channel?.name,
        views: video.views,
        uploadedAt: video.uploadedAt
      };
    } catch (error) {
      console.error('YouTube search error:', error);
      throw new Error(`Failed to search YouTube: ${error.message}`);
    }
  }

  async getAudioStream(url) {
    try {
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid YouTube URL');
      }

      console.log(`🎵 Getting audio stream for: ${url}`);

      // Create a readable stream using yt-dlp
      const ytDlpProcess = spawn('yt-dlp', [
        '--format', 'bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio',
        '--output', '-',
        '--no-playlist',
        '--quiet',
        url
      ]);

      if (!ytDlpProcess.stdout) {
        throw new Error('Failed to create yt-dlp process');
      }

      console.log(`🔗 Audio stream created successfully`);
      return ytDlpProcess.stdout;

    } catch (error) {
      console.error('Audio stream error:', error);
      throw new Error(`Failed to get audio stream: ${error.message}`);
    }
  }

  async getVideoInfo(url) {
    try {
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid YouTube URL');
      }

      // Get video info using yt-dlp
      const infoJson = await this.ytDlp.execPromise([
        url,
        '--dump-json',
        '--no-playlist'
      ]);

      const info = JSON.parse(infoJson);

      return {
        title: info.title,
        url: info.webpage_url || url,
        duration: this.formatDuration(info.duration || 0),
        durationMs: (info.duration || 0) * 1000,
        thumbnail: info.thumbnail,
        channel: info.uploader || info.channel,
        views: info.view_count,
        description: info.description
      };
    } catch (error) {
      console.error('Video info error:', error);
      throw new Error(`Failed to get video info: ${error.message}`);
    }
  }

  formatDuration(seconds) {
    // Handle various input types
    if (!seconds && seconds !== 0) return '0:00';

    // Convert to number if it's a string
    const totalSeconds = parseInt(seconds);
    if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  isValidUrl(url) {
    // Basic YouTube URL validation
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return ytRegex.test(url);
  }
}

module.exports = YouTubeService;
