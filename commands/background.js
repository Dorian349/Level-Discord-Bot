const fs = require('fs');
const path = require("path");
const {SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle} = require("discord.js")

const paginationEmbed = require('../Utils/paginationHelper.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('background')
        .setDescription('Select a background for your profile image.')
        .setDMPermission(false),
    async execute(interaction, client) {

        let lbList = await client.Levels.fetchLeaderboard(interaction.guild.id, "xp");
        lbList.sort((a, b) => parseInt(b.xp) - parseInt(a.xp));

        const button1 = new ButtonBuilder().setCustomId('previousbtn').setLabel('Previous').setStyle(ButtonStyle.Danger);
        const button2 = new ButtonBuilder().setCustomId('nextbtn').setLabel('Next').setStyle(ButtonStyle.Success);
        const button3 = new ButtonBuilder().setCustomId('selectbtn').setEmoji("✅").setLabel('Choose this background').setStyle(ButtonStyle.Success);

        let embedList = [];
        let fileList = [];
        let files = fs.readdirSync(path.dirname("index.js") + "/backgrounds/");
        for (let i = 0; i < files.length; i++) {
            const attachment = new AttachmentBuilder(path.dirname("index.js") + "/backgrounds/" + files[i], { name: files[i] });
            fileList.push(attachment);
            embedList.push(client.buildEmbed("Background #" + (i + 1) + ": " + files[i]).setImage("attachment://" + files[i]))
        }

        await paginationEmbed(interaction, embedList, [button1, button2, button3], fileList, client);
    }
};