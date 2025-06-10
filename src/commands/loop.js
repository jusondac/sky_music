const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Toggle loop mode for the current song'),

    async execute(interaction, bot) {
        const queue = bot.getQueue(interaction.guildId);

        if (!queue || !queue.currentSong) {
            return await interaction.reply({
                content: '❌ No music is currently playing!',
                flags: MessageFlags.Ephemeral
            });
        }

        const member = interaction.member;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== queue.voiceChannel.id) {
            return await interaction.reply({
                content: '❌ You need to be in the same voice channel as the bot!',
                flags: MessageFlags.Ephemeral
            });
        }

        queue.loop = !queue.loop;
        
        if (queue.loop) {
            queue.loopQueue = false; // Disable queue loop when single loop is enabled
            await interaction.reply('🔂 Single loop **enabled** - Current song will repeat');
        } else {
            await interaction.reply('🔂 Single loop **disabled**');
        }
    }
};
