const SQLite = require("better-sqlite3");
const sql = new SQLite('./profiles.sqlite');

class DiscordXp {

    static async createUser(client, userId, guildId) {
        let score = client.getScore.get(userId, guildId);
        if (!score) {
            score = {
                id: guildId + "-" + userId,
                user: userId,
                guild: guildId,
                xp: 0,
                level: 0,
                background: "default.jpg"
            }
            client.setScore.run(score);
        }
        return score;
    }

    static async deleteUser(client, userId, guildId) {
        let score = client.getScore.get(userId, guildId);
        if (!score) {
            return false;
        }
        client.deleteScore.run(userId, guildId);
        return score;
    }

    static async appendXp(client, userId, guildId, xp) {

        let score = await this.createUser(client, userId, guildId);

        score.xp += xp;
        score.level = Math.floor(0.1 * Math.sqrt(score.xp));

        client.setScore.run(score);

        return (Math.floor(0.1 * Math.sqrt(score.xp -= xp)) < score.level);
    }

    static async appendLevel(client, userId, guildId, levels) {

        let score = await this.createUser(client, userId, guildId);

        score.level += parseInt(levels, 10);
        score.xp = score.level * score.level * 100;

        client.setScore.run(score);

        return score;
    }

    static async setXp(client, userId, guildId, xp) {

        let score = await this.createUser(client, userId, guildId);

        score.xp = xp;
        score.level = Math.floor(0.1 * Math.sqrt(score.xp));

        client.setScore.run(score);

        return score;
    }

    static async setLevel(client, userId, guildId, level) {

        let score = await this.createUser(client, userId, guildId);

        score.level = level;
        score.xp = level * level * 100;

        client.setScore.run(score);

        return score;
    }

    static async setBackground(client, userId, guildId, background) {

        let score = await this.createUser(client, userId, guildId);

        score.background = background;

        client.setScore.run(score);

        return score;
    }

    static async fetch(client, userId, guildId, fetchPosition = false) {

        let score = await this.createUser(client, userId, guildId);

        if (fetchPosition === true) {
            let leaderboard = await sql.prepare("SELECT * FROM profiles WHERE guild = ? ORDER BY xp DESC").all(guildId);
            score.position = leaderboard.findIndex(i => i.user === userId) + 1;
        }


        score.cleanXp = score.xp - this.xpFor(score.level);
        score.cleanNextLevelXp = this.xpFor(score.level + 1) - this.xpFor(score.level);

        return score;
    }

    static async subtractXp(client, userId, guildId, xp) {

        let score = await this.createUser(client, userId, guildId);

        score.xp -= xp;
        score.level = Math.floor(0.1 * Math.sqrt(score.xp));

        client.setScore.run(score);

        return score;
    }

    static async subtractLevel(client, userId, guildId, levels) {

        let score = await this.createUser(client, userId, guildId);

        score.level -= levels;
        score.xp = score.level * score.level * 100;

        client.setScore.run(score);

        return score;
    }

    static async fetchLeaderboard(guildId, field) {
        return await sql.prepare("SELECT * FROM profiles WHERE guild = ? ORDER BY " + field + " DESC").all(guildId);
    }

    static xpFor (targetLevel) {
        if (isNaN(targetLevel) || isNaN(parseInt(targetLevel, 10))) throw new TypeError("Target level should be a valid number.");
        if (isNaN(targetLevel)) targetLevel = parseInt(targetLevel, 10);
        if (targetLevel < 0) throw new RangeError("Target level should be a positive number.");
        return targetLevel * targetLevel * 100;
    }

    static async deleteGuild(guildId) {
        await sql.prepare("DELETE FROM profiles WHERE guild = ?").all(guildId);
        return true;
    }
}

module.exports = DiscordXp