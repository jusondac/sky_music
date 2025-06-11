require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, MessageFlags } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

// Import services
const YouTubeService = require('./services/YouTubeService');
const LyricsService = require('./services/LyricsService');
const MusicQueue = require('./utils/MusicQueue');

class SkyMusicBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
      ]
    });

    this.commands = new Collection();
    this.queues = new Map();
    this.lyricsService = new LyricsService();
    this.youtubeService = new YouTubeService();

    this.loadCommands();
    this.setupEventHandlers();
  }

  loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      if ('data' in command && 'execute' in command) {
        this.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
      } else {
        console.log(`⚠️  Command ${file} is missing required properties`);
      }
    }
  }

  setupEventHandlers() {
    this.client.once('ready', () => {
      console.log(`🎵 ${this.client.user.tag} is online and ready to play music!`);
      this.registerSlashCommands();
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, this);
      } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        const reply = { content: 'There was an error executing this command!', flags: MessageFlags.Ephemeral };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
    });

    this.client.on('guildCreate', async (guild) => {
      console.log(`📥 Joined new guild: ${guild.name}`);
      await this.registerCommandsForGuild(guild);
    });

    this.client.on('voiceStateUpdate', (oldState, newState) => {
      const queue = this.queues.get(newState.guild.id);
      if (!queue) return;

      // If bot is alone in voice channel, leave and clear queue
      if (oldState.channelId === queue.voiceChannel?.id &&
        newState.channelId !== queue.voiceChannel?.id) {
        const members = queue.voiceChannel.members.filter(member => !member.user.bot);
        if (members.size === 0) {
          queue.destroy();
          this.queues.delete(newState.guild.id);
        }
      }
    });
  }

  async registerSlashCommands() {
    const commands = [];

    for (const command of this.commands.values()) {
      commands.push(command.data.toJSON());
    }

    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
      console.log('🔄 Refreshing slash commands...');

      // Register commands for each guild the bot is in
      for (const guild of this.client.guilds.cache.values()) {
        await rest.put(
          Routes.applicationGuildCommands(this.client.user.id, guild.id),
          { body: commands }
        );
        console.log(`✅ Successfully registered slash commands for guild: ${guild.name}`);
      }

    } catch (error) {
      console.error('❌ Error registering slash commands:', error);
    }
  }

  async registerCommandsForGuild(guild) {
    const commands = [];
    for (const command of this.commands.values()) {
      commands.push(command.data.toJSON());
    }

    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
      await rest.put(
        Routes.applicationGuildCommands(this.client.user.id, guild.id),
        { body: commands }
      );
      console.log(`✅ Registered commands for guild: ${guild.name}`);
    } catch (error) {
      console.error(`❌ Error registering commands for guild ${guild.name}:`, error);
    }
  }

  getQueue(guildId) {
    return this.queues.get(guildId);
  }

  createQueue(guildId, voiceChannel, textChannel) {
    const queue = new MusicQueue(guildId, voiceChannel, textChannel, this);
    this.queues.set(guildId, queue);
    return queue;
  }

  deleteQueue(guildId) {
    const queue = this.queues.get(guildId);
    if (queue) {
      queue.destroy();
      this.queues.delete(guildId);
    }
  }

  start() {
    this.client.login(process.env.DISCORD_TOKEN);
  }
}

// Start the bot
const bot = new SkyMusicBot();
bot.start();

module.exports = SkyMusicBot;
