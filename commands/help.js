const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche la liste des commandes disponibles'),
  async execute(interaction) {
    await interaction.reply('Voici les commandes disponibles : `/help`, `/8ball`, `/morpion`...');
  },
};
