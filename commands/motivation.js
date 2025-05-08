const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const https = require('https');

function getMotivationalQuote() {
    const url = 'https://zenquotes.io/api/random';

    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const [quote] = JSON.parse(data);
                    resolve(quote);
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('motivation')
        .setDescription('Reçois une citation motivante depuis ZenQuotes API ✨'),

    async execute(interaction) {
        try {
            const quote = await getMotivationalQuote();

            const embed = new EmbedBuilder()
                .setColor(0x00bfff)
                .setTitle('💬 Citation Motivante')
                .setDescription(`*"${quote.q}"*`)
                .setFooter({ text: `— ${quote.a}` })
                .setTimestamp();

            const button = new ButtonBuilder()
                .setCustomId('refresh_motivation')
                .setLabel('🔁 Une autre !')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(button);

            await interaction.reply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error(error);
            await interaction.reply('❌ Une erreur est survenue en récupérant une citation.');
        }
    }
};