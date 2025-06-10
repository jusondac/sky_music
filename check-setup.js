#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('🎵 Sky Music Bot - Setup Verification\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('   Please copy .env.example to .env and add your tokens\n');
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

// Check required environment variables
const requiredVars = ['DISCORD_TOKEN', 'GENIUS_ACCESS_TOKEN'];
const missingVars = [];

for (const varName of requiredVars) {
  if (!process.env[varName] || process.env[varName] === `your_${varName.toLowerCase()}_here`) {
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n   Please update your .env file with the correct tokens\n');
  process.exit(1);
}

// Check if all command files exist
const commandsDir = path.join(__dirname, 'src', 'commands');
const expectedCommands = [
  'play.js', 'pause.js', 'resume.js', 'skip.js', 'stop.js',
  'queue.js', 'volume.js', 'loop.js', 'shuffle.js',
  'nowplaying.js', 'lyrics.js', 'help.js', 'clear.js'
];

console.log('📁 Checking command files...');
for (const command of expectedCommands) {
  const commandPath = path.join(commandsDir, command);
  if (fs.existsSync(commandPath)) {
    console.log(`   ✅ ${command}`);
  } else {
    console.log(`   ❌ ${command} - Missing!`);
  }
}

// Check service files
console.log('\n🔧 Checking service files...');
const serviceFiles = ['YouTubeService.js', 'LyricsService.js'];
const servicesDir = path.join(__dirname, 'src', 'services');

for (const service of serviceFiles) {
  const servicePath = path.join(servicesDir, service);
  if (fs.existsSync(servicePath)) {
    console.log(`   ✅ ${service}`);
  } else {
    console.log(`   ❌ ${service} - Missing!`);
  }
}

// Check utility files
console.log('\n⚙️ Checking utility files...');
const utilPath = path.join(__dirname, 'src', 'utils', 'MusicQueue.js');
if (fs.existsSync(utilPath)) {
  console.log('   ✅ MusicQueue.js');
} else {
  console.log('   ❌ MusicQueue.js - Missing!');
}

console.log('\n✅ Setup verification complete!');
console.log('\n🚀 To start the bot, run: npm start');
console.log('📚 For help, check the README.md file\n');
