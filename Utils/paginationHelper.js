const { ActionRowBuilder, MessageEmbed, MessageButton } = require("discord.js");

/**
 * Creates a pagination embed
 * @param {Interaction} interaction
 * @param {MessageEmbed[]} pages
 * @param {MessageButton[]} buttonList
 * @param {number} timeout
 * @returns
 */
const paginationEmbed = async (
    interaction,
    pages,
    buttonList,
    files,
    client,
    timeout = 120000
) => {
    if (!pages) throw new Error("Pages are not given.");
    if (!buttonList) throw new Error("Buttons are not given.");

    if (buttonList[0].style === "LINK" || buttonList[1].style === "LINK")
        throw new Error(
            "Link buttons are not supported with discordjs-button-pagination"
        );

    if (buttonList.length < 2) throw new Error("Need at least two buttons.");

    let page = 0;

    const row = new ActionRowBuilder().addComponents(buttonList);

    //has the interaction already been deferred? If not, defer the reply.
    if (interaction.deferred == false) {
        await interaction.deferReply();
    }

    const curPage = await interaction.editReply({
        embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
        files: files !== undefined ? [files[page]] : [],
        components: [row],
        fetchReply: true,
    });

    const filter = (i) =>
        i.custom_id === buttonList[1].custom_id ||
        i.custom_id === buttonList[0].custom_id;

    const collector = await curPage.createMessageComponentCollector({
        filter,
        time: timeout,
    });

    collector.on("collect", async (i) => {

        switch (i.customId) {
            case buttonList[0].data.custom_id:
                page = page > 0 ? --page : pages.length - 1;
                break;
            case buttonList[1].data.custom_id:
                page = page + 1 < pages.length ? ++page : 0;
                break;
            case buttonList[2].data.custom_id:
                await i.channel.send({embeds: [client.buildEmbed("You selected the background " + i.message.embeds[0].description.split(":")[1].trim() + "!")]})
                await client.Levels.setBackground(client, i.user.id, i.guild.id, i.message.embeds[0].description.split(":")[1].trim())
                collector.stop();
                break;
            default:
                break;
        }
        await i.deferUpdate();
        await i.editReply({
            embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
            files: files !== undefined ? [files[page]] : [],
            components: [row],
        });
        collector.resetTimer();
    });

    collector.on("end", (_, reason) => {
        if (reason !== "messageDelete") {
            curPage.edit({
                embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
                files: files !== undefined ? [files[page]] : [],
                components: [],
            });
        }
    });

    return curPage;
};
module.exports = paginationEmbed;
