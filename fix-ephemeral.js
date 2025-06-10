#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const commandsDir = path.join(__dirname, 'src', 'commands');
const files = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

console.log('Updating ephemeral flags in command files...');

for (const file of files) {
  const filePath = path.join(commandsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add MessageFlags import if not present
  if (content.includes('SlashCommandBuilder') && !content.includes('MessageFlags')) {
    content = content.replace(
      /const { SlashCommandBuilder(.*?) } = require\('discord\.js'\);/,
      "const { SlashCommandBuilder$1, MessageFlags } = require('discord.js');"
    );
  }

  // Replace ephemeral: true with flags: MessageFlags.Ephemeral
  content = content.replace(/ephemeral: true/g, 'flags: MessageFlags.Ephemeral');

  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated ${file}`);
}

console.log('✅ All command files updated!');
