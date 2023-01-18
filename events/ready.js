const SQLite = require("better-sqlite3");
const sql = new SQLite('./profiles.sqlite');
const { REST, Routes } = require('discord.js');
const config = require('../config.json');
const fs = require('fs');
const path = require('path')

const commands = [];
const commandsPath = path.join(__dirname, '..', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(commandsPath + `/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.token);

module.exports = {
    name: 'ready',
    async execute(client) {
        console.log(`Discord level bot has started with ${client.users.cache.size} users, in ${client.channels.cache.size} channels.`);

        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands },
            );

            console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }

        const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'profiles';").get();
        if (!table['count(*)']) {
            sql.prepare("CREATE TABLE profiles (id TEXT PRIMARY KEY, user TEXT, guild TEXT, xp INTEGER, level INTEGER, background TEXT);").run();
            sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON profiles (id);").run();
            sql.pragma("synchronous = 1");
            sql.pragma("journal_mode = wal");
        }

        client.getScore = sql.prepare("SELECT * FROM profiles WHERE user = ? AND guild = ?");
        client.deleteScore = sql.prepare("DELETE FROM profiles WHERE user = ? AND guild = ?");
        client.setScore = sql.prepare("INSERT OR REPLACE INTO profiles (id, user, guild, xp, level, background) VALUES (@id, @user, @guild, @xp, @level, @background);");
    }
}