const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const citations = [
    "🌟 Crois en toi, toujours.",
    "🚀 Chaque jour est une nouvelle chance de briller.",
    "🔥 L’échec est simplement l’opportunité de recommencer, mais de manière plus intelligente.",
    "💪 Ne laisse jamais les peurs décider de ton avenir.",
    "✨ L'avenir appartient à ceux qui croient à la beauté de leurs rêves.",
    "🌱 Commence où tu es, utilise ce que tu as, fais ce que tu peux.",
    "🌞 Chaque petit pas te rapproche de ton objectif.",
    "🏆 Le succès ne vient pas à toi, tu dois aller à lui.",
    "🎯 La seule façon d’échouer, c’est de ne jamais essayer.",
    "🔥 Ton potentiel est illimité, ne te limite pas.",
    "🌟 Les grandes choses ne viennent jamais d'une zone de confort.",
    "🚀 Le seul obstacle à ton succès, c’est toi-même.",
    "💡 Tu es plus fort que tu ne le penses, et plus proche de ton but que tu ne l'imagines.",
    "🌈 Ne laisse jamais les doutes t'arrêter, continue d'avancer.",
    "🎉 Le bonheur n'est pas quelque chose de prêt à l'emploi, il vient de tes propres actions.",
    "💥 N'abandonne pas. Chaque échec est une étape vers le succès."
];

function getRandomQuote() {
    return citations[Math.floor(Math.random() * citations.length)];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('motivation')
        .setDescription('Reçois une citation motivante ✨'),

    async execute(interaction) {
        const quote = getRandomQuote();

        const embed = new EmbedBuilder()
            .setColor(0xfcc203)
            .setTitle('💬 Citation Motivante')
            .setDescription(quote)
            .setTimestamp();

        const button = new ButtonBuilder()
            .setCustomId('new_motivation')
            .setLabel('🔁 Une autre !')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({ embeds: [embed], components: [row] });
    },

    // Export aussi la fonction si nécessaire pour ailleurs :
    getRandomQuote
};