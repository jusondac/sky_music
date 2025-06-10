const { Client } = require('genius-lyrics');

class LyricsService {
  constructor() {
    this.genius = new Client(process.env.GENIUS_ACCESS_TOKEN);
    this.cache = new Map();
  }

  async searchLyrics(title, artist = '') {
    try {
      // Validate input
      if (!title || title.trim().length === 0) {
        console.log('Empty title provided for lyrics search');
        return null;
      }

      // Create search query
      const searchQuery = artist ? `${artist} ${title}` : title;
      const cacheKey = searchQuery.toLowerCase();

      // Check cache first
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      console.log(`🔍 Searching lyrics for: "${searchQuery}"`);

      // Search on Genius with proper validation
      const searches = await this.genius.songs.search(searchQuery.trim());

      if (!searches || searches.length === 0) {
        console.log('No lyrics found on Genius');
        return null;
      }

      // Get the first result
      const song = searches[0];

      // Validate song object
      if (!song || !song.title) {
        console.log('Invalid song object received from Genius');
        return null;
      }

      console.log(`📝 Found song: "${song.title}" by ${song.artist?.name || 'Unknown'}`);

      const lyrics = await song.lyrics();

      if (!lyrics || lyrics.trim().length === 0) {
        console.log('No lyrics content available');
        return null;
      }

      const result = {
        title: song.title,
        artist: song.artist?.name || 'Unknown Artist',
        lyrics: this.cleanLyrics(lyrics),
        url: song.url,
        thumbnail: song.image,
        releaseDate: song.releasedAt
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      // Limit cache size
      if (this.cache.size > 100) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      return result;
    } catch (error) {
      console.error('Lyrics search error:', error);
      return null;
    }
  }

  cleanLyrics(lyrics) {
    if (!lyrics) return '';

    // Remove unwanted patterns and clean up
    return lyrics
      .replace(/\[.*?\]/g, '') // Remove [Verse 1], [Chorus], etc.
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .replace(/\s{2,}/g, ' '); // Replace multiple spaces with single space
  }

  // Split lyrics into chunks for Discord embed limitations
  splitLyrics(lyrics, maxLength = 4000) {
    if (!lyrics || lyrics.length <= maxLength) {
      return [lyrics || 'No lyrics available'];
    }

    const chunks = [];
    const lines = lyrics.split('\n');
    let currentChunk = '';

    for (const line of lines) {
      if ((currentChunk + line + '\n').length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = line + '\n';
        } else {
          // Line is too long, split it
          chunks.push(line.substring(0, maxLength - 3) + '...');
          currentChunk = '...' + line.substring(maxLength - 3) + '\n';
        }
      } else {
        currentChunk += line + '\n';
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : ['No lyrics available'];
  }

  // Extract artist and title from various formats
  parseTrackInfo(input) {
    // Common patterns: "Artist - Title", "Title by Artist", "Artist: Title"
    let artist = '';
    let title = input;

    const patterns = [
      /^(.+?)\s*-\s*(.+)$/, // Artist - Title
      /^(.+?)\s*:\s*(.+)$/, // Artist: Title
      /^(.+?)\s+by\s+(.+)$/i, // Title by Artist
      /^(.+?)\s*\|\s*(.+)$/, // Artist | Title
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        if (pattern.source.includes('by')) {
          // "Title by Artist" format
          title = match[1].trim();
          artist = match[2].trim();
        } else {
          // "Artist - Title" format
          artist = match[1].trim();
          title = match[2].trim();
        }
        break;
      }
    }

    return { artist, title };
  }

  // Get lyrics with automatic artist/title parsing
  async getLyrics(input) {
    const { artist, title } = this.parseTrackInfo(input);
    return await this.searchLyrics(title, artist);
  }
}

module.exports = LyricsService;
