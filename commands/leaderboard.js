const { SlashCommandBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const paginationEmbed = require('../Utils/paginationHelper.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('See the xp leaderboard of your server.')
        .setDMPermission(false),
    async execute(interaction, client) {

        await interaction.guild.members.fetch();

        let lbList = await client.Levels.fetchLeaderboard(interaction.guild.id, "xp");
        lbList.sort((a, b) => parseInt(b.xp) - parseInt(a.xp));

        const button1 = new ButtonBuilder().setCustomId('previousbtn').setLabel('Previous').setStyle(ButtonStyle.Danger);
        const button2 = new ButtonBuilder().setCustomId('nextbtn').setLabel('Next').setStyle(ButtonStyle.Success);

        let embedList = [];
        const chunkSize = 10;
        for (let i = 0; i < lbList.length; i += chunkSize) {
            const chunk = lbList.slice(i, i + chunkSize);
            let embed = client.buildEmbed(null).setTitle("Leaderboard").addFields([...chunk.map((currElement, index) => {
                return { name: (index + Math.floor(i/chunkSize) + 1) + ". " + client.users.cache.get(lbList[index + Math.floor(i/chunkSize)].user).tag, value: "XP `" + lbList[index + Math.floor(i/chunkSize)].xp + "` - Level `" + lbList[index + Math.floor(i/chunkSize)].level + "`", inline: false}
            })]);
            embedList.push(embed);
        }

        await paginationEmbed(interaction, embedList, [button1, button2]);
    }
};