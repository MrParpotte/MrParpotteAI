const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🛠️ Déploiement des commandes Slash...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      // ou Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID) pour test immédiat
      { body: commands },
    );

    console.log('✅ Déploiement terminé !');
  } catch (error) {
    console.error(error);
  }
})();