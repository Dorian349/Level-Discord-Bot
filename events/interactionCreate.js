module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {

        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        await client.Levels.appendXp(client, interaction.user.id, interaction.guild.id, 0);

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};
