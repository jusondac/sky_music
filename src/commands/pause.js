const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song'),

    async execute(interaction, bot) {
        const queue = bot.getQueue(interaction.guildId);

        if (!queue || !queue.isPlaying) {
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

        if (queue.pause()) {
            await interaction.reply('⏸️ Music paused.');
        } else {
            await interaction.reply({
                content: '❌ Music is already paused or not playing!',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
