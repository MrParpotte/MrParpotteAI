const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blague')
        .setDescription('Envoie une blague au hasard 😄'),

    async execute(interaction) {
        const blagues = [
            "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau.",
            "Un zéro dit à un huit : 'Sympa ta ceinture !'",
            "Pourquoi les squelettes ne se battent-ils jamais entre eux ? Ils n'ont pas les tripes.",
            "Pourquoi les canards sont-ils toujours à l'heure ? Parce qu'ils sont dans le coin !",
            "Que fait un électricien lorsqu’il rencontre une blague ? Il branche le courant !",
            "Pourquoi les poissons détestent l’ordinateur ? Parce qu’ils ont peur du net.",
            "Pourquoi les chauves-souris sont-elles de mauvaises conductrices ? Parce qu'elles n'ont pas de permis de conduire.",
            "Pourquoi les vaches ne portent-elles jamais de lunettes ? Parce qu'elles ont déjà de bonnes lunettes !",
            "Quel est le comble pour un électricien ? De ne pas être au courant.",
            "Pourquoi les éléphants n'utilisent-ils jamais d'ordinateur ? Parce qu'ils ont peur de la souris.",
            "Quel est le comble pour un photographe ? De ne pas avoir de vue.",
            "Pourquoi les astronautes sont-ils mauvais en cuisine ? Parce qu'ils sont toujours dans l’espace.",
            "Que dit un livre à un autre livre ? Tu me fais tourner la page !",
            "Pourquoi les abeilles ont-elles du mal à aller à l'école ? Parce qu'elles sont toujours occupées à faire du miel.",
            "Qu'est-ce qu'un vampire au téléphone ? Un appel du sang !"
        ];

        const random = blagues[Math.floor(Math.random() * blagues.length)];

        await interaction.reply(`😂 ${random}`);
    }
};