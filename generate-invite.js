require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  const applicationId = client.user.id;

  // Required permissions for the music bot
  const permissions = [
    'ViewChannel',      // 1024
    'SendMessages',     // 2048
    'UseSlashCommands', // 2147483648
    'Connect',          // 1048576
    'Speak',            // 2097152
    'UseVAD'            // 33554432
  ];

  // Calculate permission integer
  const permissionValue =
    1024 +       // ViewChannel
    2048 +       // SendMessages
    2147483648 + // UseSlashCommands
    1048576 +    // Connect
    2097152 +    // Speak
    33554432;    // UseVAD

  const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${applicationId}&permissions=${permissionValue}&scope=bot%20applications.commands`;

  console.log('\n🔗 Bot Invite Link:');
  console.log('==================');
  console.log(inviteLink);
  console.log('\n📋 Instructions:');
  console.log('1. Copy the link above');
  console.log('2. Paste it in your browser');
  console.log('3. Select the server you want to add the bot to');
  console.log('4. Make sure all permissions are checked');
  console.log('5. Click "Authorize"');
  console.log('\n✅ Bot Application ID:', applicationId);

  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
