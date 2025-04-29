require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActivityType,
  Collection,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  PermissionFlagsBits,
  AutoModerationRuleTriggerType,
  AutoModerationActionType
} = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

const statuses = [
  { name: 'en ligne et prêt à fonctionner.', type: ActivityType.Playing },
  { name: 'les vidéos de MrParpotte', type: ActivityType.Watching },
  { name: 'aider les utilisateurs est ma mission.', type: ActivityType.Playing },
  { name: '/help pour commencer', type: ActivityType.Playing },
  { name: 'connecté, toujours disponible pour aider.', type: ActivityType.Playing },
  { name: 'sécurisation en cours... Je garde tout sous contrôle.', type: ActivityType.Watching },
  { name: 'maintenance en cours... mais je suis toujours là.', type: ActivityType.Playing },
];

let board = Array(9).fill(null);
let playerTurn = '❌';
let gameActive = false;
let isSolo = false;

function creeGrilleBoutons() {
  return [
    new ActionRowBuilder().addComponents(
      ...[0, 1, 2].map(i => new ButtonBuilder()
        .setCustomId(`morpion_${i}`)
        .setLabel(board[i] ?? (i + 1).toString())
        .setStyle(ButtonStyle.Primary))
    ),
    new ActionRowBuilder().addComponents(
      ...[3, 4, 5].map(i => new ButtonBuilder()
        .setCustomId(`morpion_${i}`)
        .setLabel(board[i] ?? (i + 1).toString())
        .setStyle(ButtonStyle.Primary))
    ),
    new ActionRowBuilder().addComponents(
      ...[6, 7, 8].map(i => new ButtonBuilder()
        .setCustomId(`morpion_${i}`)
        .setLabel(board[i] ?? (i + 1).toString())
        .setStyle(ButtonStyle.Primary))
    )
  ];
}

function checkVictory() {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  return wins.some(([a, b, c]) =>
    board[a] && board[a] === board[b] && board[a] === board[c]
  );
}

function botPlay() {
  const empty = board.map((val, i) => val === null ? i : null).filter(i => i !== null);
  if (empty.length === 0) return;
  const rand = empty[Math.floor(Math.random() * empty.length)];
  board[rand] = playerTurn;
}

function choisirCoupBot() {
  // 1. Cherche un coup gagnant
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = '⭕';
      if (checkVictory()) {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }
  }

  // 2. Bloque le joueur s’il peut gagner
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = '❌';
      if (checkVictory()) {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }
  }

  // 3. Sinon joue aléatoirement
  const coupsLibres = board
    .map((val, idx) => (val === null ? idx : null))
    .filter(val => val !== null);

  return coupsLibres[Math.floor(Math.random() * coupsLibres.length)];
}

client.once('ready', async () => {
  const pourcentages = [0, 10, 20, 60, 80, 90, 91, 95, 99, 100];

  for (let i = 0; i < pourcentages.length; i++) {
    console.log(`✅ ${client.user.tag} DEMARRAGE...${pourcentages[i]}%`);

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`✅ ${client.user.tag} est prêt et en ligne !`);

  const updateStatus = () => {
    const random = statuses[Math.floor(Math.random() * statuses.length)];
    client.user.setPresence({
      activities: [random],
      status: 'dnd'
    });
  };

  updateStatus();
  setInterval(updateStatus, 15 * 1000);
});

client.on('messageCreate', async message => {
  if (message.content.startsWith('?morpion')) {
    if (gameActive) return message.reply("❌ Une partie est déjà en cours.");

    // Réinitialisation
    board = Array(9).fill(null);
    playerTurn = '❌';
    gameActive = true;
    isSolo = true; // mode solo activé

    await message.channel.send({
      content: `🎮 Morpion solo lancé ! C'est à ${playerTurn} de jouer.`,
      components: creeGrilleBoutons()
    });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const index = parseInt(interaction.customId.split('_')[1]);
  if (!gameActive || board[index] !== null) {
    return interaction.reply({ content: "❌ Case invalide.", ephemeral: true });
  }

  board[index] = playerTurn;

  if (checkVictory()) {
    gameActive = false;
    return interaction.update({
      content: `🎉 ${playerTurn} a gagné !`,
      components: []
    });
  }

  if (board.every(cell => cell !== null)) {
    gameActive = false;
    return interaction.update({
      content: "🤝 Match nul !",
      components: []
    });
  }

  // Changer de joueur
  playerTurn = playerTurn === '❌' ? '⭕' : '❌';

  // Si solo, faire jouer le bot
  if (isSolo && playerTurn === '⭕') {
    const botMove = choisirCoupBot();
    board[botMove] = '⭕';

    if (checkVictory()) {
      await interaction.editReply({ content: `⭕ (bot) a gagné !`, components: creeGrilleBoutons() });
      gameActive = false;
      return;
    } else if (board.every(cell => cell !== null)) {
      await interaction.editReply({ content: 'Match nul !', components: creeGrilleBoutons() });
      gameActive = false;
      return;
    }

    playerTurn = '❌';
  }


  await interaction.update({
    content: `C'est à ${playerTurn} de jouer.`,
    components: creeGrilleBoutons()
  });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '?devine') {
    const nombreMystere = Math.floor(Math.random() * 100) + 1;
    let tentatives = 0;

    await message.channel.send("🤔 J’ai choisi un nombre entre **1 et 100**. Devine-le !");

    const filtre = m => m.author.id === message.author.id;

    const collector = message.channel.createMessageCollector({ filter: filtre, time: 60000 });

    collector.on('collect', msg => {
      const guess = parseInt(msg.content, 10);
      if (isNaN(guess)) {
        msg.reply("❌ Merci d’envoyer un **nombre** !");
        return;
      }

      tentatives++;

      if (guess === nombreMystere) {
        msg.reply(`🎉 Bravo ! Tu as trouvé le nombre **${nombreMystere}** en **${tentatives}** tentative(s) !`);
        collector.stop('trouvé');
      } else if (guess < nombreMystere) {
        msg.reply("🔺 C’est plus !");
      } else {
        msg.reply("🔻 C’est moins !");
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason !== 'trouvé') {
        message.channel.send(`⌛ Temps écoulé ! Le nombre était **${nombreMystere}**.`);
      }
    });
  }
});

client.on('messageCreate', message => {
  if (message.author.bot) return;
  db.run(`INSERT INTO activity(userId, count)
  VALUES(?, 1)
  ON CONFLICT(userId) DO UPDATE SET count = count + 1`,
    [message.author.id]);


  const content = message.content.toLowerCase();

  if (content === '?about') {
    message.channel.send("🎬 **MrParpotte**, créateur de contenu passionné par le fun, les jeux et les fails légendaires. Sur cette chaîne, on rigole, on partage et on s’ambiance ensemble ! Abonne-toi et fais partie de l’aventure 💥\n📺 YouTube : https://youtube.com/@MrParpotte");
  }

  if (content === '?top') {
    db.all(`SELECT userId, count FROM activity ORDER BY count DESC LIMIT 5`, [], async (err, rows) => {
      if (err) {
        console.error(err);
        return message.channel.send("❌ Erreur lors de la récupération du classement.");
      }

      if (rows.length === 0) {
        return message.channel.send("📉 Pas encore d'activité enregistrée.");
      }

      const classement = await Promise.all(rows.map(async (row, i) => {
        const member = await message.guild.members.fetch(row.userId).catch(() => null);
        const username = member ? member.user.tag : "Utilisateur inconnu";
        return `**#${i + 1}** – \`${username}\` : **${row.count} messages**`;
      }));

      const embed = {
        color: 0xffcc00,
        title: '🏆 Top 5 des membres actifs',
        description: classement.join('\n'),
        footer: { text: 'Classement basé sur l\'activité des messages' },
        timestamp: new Date()
      };

      message.channel.send({ embeds: [embed] });
    });
  }

  if (content === '?me') {
    db.all(`SELECT userId, count FROM activity ORDER BY count DESC`, [], async (err, rows) => {
      if (err) {
        console.error(err);
        return message.channel.send("❌ Erreur lors de la récupération de votre classement.");
      }

      if (rows.length === 0) {
        return message.channel.send("📉 Aucune activité enregistrée pour le moment.");
      }

      const userId = message.author.id;
      const rank = rows.findIndex(row => row.userId === userId);

      if (rank === -1) {
        return message.channel.send("😕 Vous n'avez pas encore envoyé de message !");
      }

      const userCount = rows[rank].count;

      const embed = {
        color: 0x3498db,
        title: `📊 Rang de ${message.author.username}`,
        description: `**Position :** #${rank + 1}\n**Messages envoyés :** ${userCount}`,
        footer: { text: 'Continue à discuter pour grimper dans le classement !' },
        timestamp: new Date()
      };

      message.channel.send({ embeds: [embed] });
    });
  }

  if (content === '?serveur') {
    message.channel.send("🛡️ **Bienvenue sur le serveur officiel de MrParpotte !**\nIci, c’est fun, chill et 100% communauté. Participe aux events, échange avec d’autres fans et profite des nouveautés en avant-première !\n🎉 #MrParpotte");
  }

  if (content === '?blague') {
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
    message.channel.send(`😂 ${random}`);
  }


  if (content === '?motivation') {
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

    const random = citations[Math.floor(Math.random() * citations.length)];
    message.channel.send(random);
  }


  if (content.startsWith('?sondage')) {
    const question = message.content.slice(9).trim();
    if (!question) {
      return message.channel.send("❗ Utilisation : `?sondage Votre question ici`");
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📊 Sondage')
      .setDescription(`${question}`)
      .setFooter({ text: 'Répondez avec ✅ pour Oui, ❌ pour Non' })
      .setTimestamp();


    message.channel.send({ embeds: [embed] }).then(poll => {
      poll.react('✅');
      poll.react('❌');
    }).catch(console.error);
  }

  if (content === '?roulette') {
    const balle = Math.floor(Math.random() * 6); // 1 chance sur 6
    if (balle === 0) {
      message.channel.send("💥 *Pan !* Tu as perdu... RIP 😵");
    } else {
      message.channel.send("😌 Tu es sauf... cette fois !");
    }
  }

  if (content.startsWith('?dé')) {
    const args = content.split(' ');
    let faces = parseInt(args[1]) || 6;
    if (faces < 1) faces = 6;

    const resultat = Math.floor(Math.random() * faces) + 1;
    message.channel.send(`🎲 Tu as lancé un dé à ${faces} faces : **${resultat}**`);
  }

  if (content.startsWith('?duel')) {
    const opponent = message.mentions.users.first();
    if (!opponent || opponent.id === message.author.id) {
      return message.channel.send("❗ Mentionne un adversaire valide pour le duel : `?duel @pseudo`");
    }

    const gagnant = Math.random() < 0.5 ? message.author : opponent;
    message.channel.send(`⚔️ ${message.author} défie ${opponent}... et le gagnant est **${gagnant}** !`);
  }

  if (message.content.startsWith('?8ball')) {
    const question = message.content.slice(6).trim();

    if (!question) {
      return message.reply("Tu dois poser une question pour que je puisse y répondre !");
    }

    const réponses = [
      "Oui, clairement.",
      "Non, sûrement pas.",
      "Peut-être bien que oui, peut-être bien que non...",
      "Je ne pense pas.",
      "C’est certain.",
      "Demande plus tard.",
      "J’ai des doutes.",
      "Absolument !",
      "Nope.",
      "Tu connais déjà la réponse."
    ];

    const aléatoire = réponses[Math.floor(Math.random() * réponses.length)];
    return message.reply(`🎱 ${aléatoire}`);
  }

});

setInterval(() => console.log('✅ RESET EN COURS...'), 60_000);

const db = require('./database');

client.login(process.env.DISCORD_TOKEN);

process.stdin.resume();