const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Change the music volume')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume level (0-100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)
        ),

    async execute(interaction, bot) {
        const volume = interaction.options.getInteger('level');
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

        queue.setVolume(volume);
        
        let emoji = '🔊';
        if (volume === 0) emoji = '🔇';
        else if (volume < 30) emoji = '🔉';

        await interaction.reply(`${emoji} Volume set to **${volume}%**`);
    }
};
