const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Show bot connection information'),

  async execute(interaction, bot) {
    try {
      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🤖 Bot Information')
        .addFields(
          { name: '🆔 Bot ID', value: bot.client.user.id, inline: true },
          { name: '🏷️ Bot Tag', value: bot.client.user.tag, inline: true },
          { name: '🌐 Total Guilds', value: bot.client.guilds.cache.size.toString(), inline: true },
          { name: '📡 Guild ID', value: interaction.guildId || 'Unknown', inline: true },
          { name: '🔗 Guild in Cache', value: bot.client.guilds.cache.has(interaction.guildId) ? 'Yes' : 'No', inline: true },
          { name: '👥 Guild Members', value: interaction.guild?.memberCount?.toString() || 'Unknown', inline: true }
        )
        .setTimestamp();

      if (bot.client.guilds.cache.size > 0) {
        const guildNames = Array.from(bot.client.guilds.cache.values()).map(g => g.name).join(', ');
        embed.addFields({ name: '🏰 Connected Guilds', value: guildNames });
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Bot info error:', error);
      await interaction.reply({
        content: `❌ Error getting bot info: ${error.message}`,
        ephemeral: true
      });
    }
  }
};
