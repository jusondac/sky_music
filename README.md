# Sky Music Bot 🎵

A powerful Discord music bot that can search and play music from YouTube with synchronized lyrics from Genius.

## Features

- 🎵 Play music from YouTube (search or direct URLs)
- 📝 Automatic lyrics display synchronized with the song
- 🔄 Loop modes (single song)
- 🔀 Queue shuffling
- 🎚️ Volume control
- 📋 Comprehensive queue management
- ⏯️ Pause/Resume/Skip controls
- 🎤 Rich embeds with song information

## Commands

All commands are slash commands (type `/` in Discord):

### Music Playback
- `/play <song>` - Play a song from YouTube
- `/pause` - Pause the current song
- `/resume` - Resume the paused song
- `/stop` - Stop music and clear queue
- `/skip` - Skip the current song

### Queue Management
- `/queue` - Show the current queue
- `/shuffle` - Shuffle the queue
- `/loop` - Toggle single song loop
- `/nowplaying` - Show current song info

### Settings & Info
- `/volume <0-100>` - Change volume
- `/lyrics [song]` - Get lyrics for current or specified song
- `/help` - Show help message

## Setup Instructions

### 1. Prerequisites

- Node.js 16.0.0 or higher
- A Discord application and bot token
- A Genius API access token (for lyrics)

### 2. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section
4. Create a bot and copy the token
5. Enable the following bot permissions:
   - Send Messages
   - Use Slash Commands
   - Connect (to voice channels)
   - Speak (in voice channels)
   - Use Voice Activity

### 3. Genius API Setup

1. Go to [Genius API](https://genius.com/api-clients)
2. Create a new API client
3. Copy the access token

### 4. Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env` file and fill in your tokens:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   GENIUS_ACCESS_TOKEN=your_genius_access_token_here
   ```

### 5. Running the Bot

```bash
# Production
npm start

# Development (with auto-restart)
npm run dev
```

### 6. Invite Bot to Server

1. Go to Discord Developer Portal → Your App → OAuth2 → URL Generator
2. Select scopes: `bot` and `applications.commands`
3. Select permissions: `Send Messages`, `Use Slash Commands`, `Connect`, `Speak`
4. Use the generated URL to invite the bot to your server

## Required Permissions

The bot needs the following permissions in Discord:
- Send Messages
- Use Slash Commands
- Connect (to voice channels)
- Speak (in voice channels)
- Use Voice Activity
- Read Message History

## Dependencies

- discord.js - Discord API wrapper
- @discordjs/voice - Voice connection handling
- ytdl-core - YouTube downloader
- youtube-sr - YouTube search
- genius-lyrics - Lyrics fetching
- ffmpeg-static - Audio processing

## Troubleshooting

### Common Issues

1. **Bot doesn't respond to commands**: Make sure slash commands are registered (happens automatically on startup)
2. **No audio in voice channel**: Check bot permissions and ensure ffmpeg is available
3. **Lyrics not showing**: Verify Genius API token is correct
4. **YouTube videos not playing**: Some videos may be age-restricted or region-locked

### FFmpeg Installation

If you encounter audio issues, you may need to install FFmpeg:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from [FFmpeg website](https://ffmpeg.org/download.html)

## Support

For issues and questions, please check the troubleshooting section above or create an issue in the repository.

## License

This project is licensed under the MIT License.
