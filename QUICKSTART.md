# Quick Start Guide

## 🚀 Get Your Bot Running in 5 Minutes!

### Step 1: Get Discord Bot Token
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" section → Click "Add Bot"
4. Copy the bot token (keep it secret!)

### Step 2: Get Genius API Token
1. Go to [Genius API](https://genius.com/api-clients)
2. Click "New API Client"
3. Fill in the form (use any website URL for callback)
4. Copy the "Client Access Token"

### Step 3: Configure the Bot
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and add your tokens:
   ```
   DISCORD_TOKEN=your_actual_discord_token_here
   GENIUS_ACCESS_TOKEN=your_actual_genius_token_here
   ```

### Step 4: Install and Start
```bash
npm install
npm start
```

### Step 5: Invite Bot to Server
1. Go back to Discord Developer Portal → Your App → OAuth2 → URL Generator
2. Select scopes: `bot` and `applications.commands`
3. Select permissions:
   - Send Messages
   - Use Slash Commands
   - Connect (to voice channels)
   - Speak (in voice channels)
4. Copy the generated URL and open it to invite the bot

### Step 6: Test the Bot
1. Join a voice channel in your Discord server
2. Type `/play never gonna give you up`
3. Enjoy your music with synchronized lyrics! 🎵

## 🎵 Available Commands
- `/play <song>` - Play music from YouTube
- `/pause` / `/resume` - Control playback
- `/skip` - Skip current song
- `/queue` - Show current queue
- `/lyrics` - Get lyrics for current/specified song
- `/volume <0-100>` - Change volume
- `/help` - Show all commands

## 🔧 Troubleshooting
- Run `npm run check` to verify setup
- Check the README.md for detailed troubleshooting
- Make sure you have Node.js 16+ installed
