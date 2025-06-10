const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current music queue'),

    async execute(interaction, bot) {
        const queue = bot.getQueue(interaction.guildId);

        if (!queue || (!queue.currentSong && queue.songs.length === 0)) {
            return await interaction.reply({
                content: '❌ The queue is empty!',
                flags: MessageFlags.Ephemeral
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('📋 Music Queue')
            .setTimestamp();

        // Current song
        if (queue.currentSong) {
            const status = queue.isPaused ? '⏸️ Paused' : '▶️ Playing';
            embed.addFields({
                name: `${status} - Now Playing`,
                value: `**${queue.currentSong.title}**\nRequested by: ${queue.currentSong.requestedBy}`,
                inline: false
            });
        }

        // Queue songs
        if (queue.songs.length > 0) {
            const queueList = queue.songs
                .slice(0, 10) // Show max 10 songs
                .map((song, index) => `\`${index + 1}.\` **${song.title}**\nRequested by: ${song.requestedBy}`)
                .join('\n\n');

            embed.addFields({
                name: `📋 Up Next (${queue.songs.length} song${queue.songs.length === 1 ? '' : 's'})`,
                value: queueList,
                inline: false
            });

            if (queue.songs.length > 10) {
                embed.addFields({
                    name: '➕ And More...',
                    value: `${queue.songs.length - 10} more song${queue.songs.length - 10 === 1 ? '' : 's'} in queue`,
                    inline: false
                });
            }
        }

        // Additional info
        const info = [];
        if (queue.loop) info.push('🔂 Single Loop ON');
        if (queue.loopQueue) info.push('🔁 Queue Loop ON');
        info.push(`🔊 Volume: ${queue.volume}%`);

        if (info.length > 0) {
            embed.addFields({
                name: '⚙️ Settings',
                value: info.join(' | '),
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
