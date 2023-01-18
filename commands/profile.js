const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const canvacord = require('canvacord');
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your level profile.')
        .setDMPermission(false),
    async execute(interaction, client) {
        const target = interaction.options.getUser("user") || interaction.user;
        const user = await client.Levels.fetch(client, target.id, interaction.guild.id, true);

        fs.readFile(path.dirname("index.js") + "/backgrounds/" + user.background, (err, data) => {
            if (err) throw err;
            let str = data.toString('base64')
            data = Buffer.from(str, 'base64');

            const rank = new canvacord.Rank()
                .setBackground("IMAGE", data)
                .setAvatar(target.displayAvatarURL({format: 'png', size: 512}))
                .setCurrentXP(user.xp)
                .setRequiredXP(client.Levels.xpFor(user.level + 1))
                .setRank(user.position)
                .setLevel(user.level)
                .setStatus(interaction.guild.members.cache.get(target.id).presence.status)
                .setProgressBar("#FFFFFF")
                .setUsername(target.username)
                .setDiscriminator(target.discriminator);

            rank.build()
                .then(data => {
                    const attachment = new AttachmentBuilder(data, { name: 'profile.png' });
                    interaction.reply({ files: [attachment] });
                });
        });
    }
};