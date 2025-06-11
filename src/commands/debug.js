const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('debug')
    .setDescription('Debug bot connection and permissions'),

  async execute(interaction, bot) {
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('🔧 Bot Debug Information')
      .setTimestamp();

    // Guild information
    if (interaction.guild) {
      embed.addFields(
        { name: '🏠 Guild', value: interaction.guild.name, inline: true },
        { name: '🆔 Guild ID', value: interaction.guild.id, inline: true },
        { name: '👥 Members', value: interaction.guild.memberCount.toString(), inline: true }
      );
    } else {
      embed.addFields(
        { name: '❌ Guild', value: 'No guild context', inline: true },
        { name: '🆔 Guild ID', value: interaction.guildId || 'Unknown', inline: true }
      );
    }

    // Bot information
    const botMember = interaction.guild?.members.cache.get(bot.client.user.id);
    embed.addFields(
      { name: '🤖 Bot Status', value: bot.client.user.tag, inline: true },
      { name: '📊 Cached Guilds', value: bot.client.guilds.cache.size.toString(), inline: true },
      { name: '🔊 Voice Permissions', value: botMember ? 'Connected' : 'Not found', inline: true }
    );

    // Voice state information
    const member = interaction.guild?.members.cache.get(interaction.user.id);
    const voiceState = interaction.guild?.voiceStates.cache.get(interaction.user.id);

    if (voiceState?.channel) {
      embed.addFields(
        { name: '🎤 Your Voice Channel', value: voiceState.channel.name, inline: true },
        { name: '🔊 Channel ID', value: voiceState.channelId, inline: true }
      );
    } else {
      embed.addFields(
        { name: '🎤 Your Voice Channel', value: 'Not connected', inline: true }
      );
    }

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};
