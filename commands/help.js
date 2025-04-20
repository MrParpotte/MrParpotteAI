const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription("Affiche la liste des commandes disponibles"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle('📖 Aide de MrParpotte AI')
      .setDescription('Voici la liste des commandes disponibles :')
      .addFields(
        { name: '🎉 Communauté', value: '`/blague`, `/sondage`, `/motivation`, `/social`' },
        { name: '🎮 Jeux & Mini-jeux', value: '`/roulette`, `/dé`, `/duel`, `/morpion`, `/devine`, `/8ball`' },
        { name: '📈 Classement', value: '`/top`, `/me`' },
        { name: '📺 YouTube', value: '`/vidéo`' },
        { name: '🧠 Utilitaire', value: '`/ping`' },
        { name: 'ℹ️ Infos', value: '`/about`, `/serveur`, `/help`' },
      )
      .setFooter({ text: 'Utilise les commandes dans un canal autorisé.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true }); // réponse privée
  },
};
