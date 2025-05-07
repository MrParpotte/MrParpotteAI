const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blague')
        .setDescription('Reçoit une blague aléatoire 😄'),

    async execute(interaction) {
        try {
            const response = await fetch('https://www.blagues-api.fr/api/random', {
                headers: {
                    Authorization: `Bearer ${process.env.BLAGUES_API_TOKEN}`
                }
            });

            if (!response.ok) throw new Error("Erreur API");

            const blague = await response.json();

            // Envoie la blague (avec ou sans réponse selon le type)
            await interaction.reply(`😂 **${blague.joke}**\n${blague.answer ? `👉 ${blague.answer}` : ''}`);
        } catch (error) {
            console.error(error);
            await interaction.reply("❌ Une erreur est survenue en récupérant une blague.");
        }
    }
};