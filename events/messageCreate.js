module.exports = {
    name: 'messageCreate',
    async execute(client, message) {

        if (message.author.bot || !message.guild) return;

        await client.Levels.appendXp(client, message.author.id, message.guild.id, 1);
    }
}