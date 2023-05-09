const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
      data: new SlashCommandBuilder()
            .setName('poll')
            .setDescription('Create a poll with up to 4 reactions. Server Administrators command.')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option.setName('description').setDescription('What do you want the poll to say?').setRequired(true))
            .addStringOption(option => option.setName('emotea').setDescription('First emote.').setRequired(true))
            .addStringOption(option => option.setName('emoteb').setDescription('Second emote. Leave blank if not required'))
            .addStringOption(option => option.setName('emotec').setDescription('Third emote. Leave blank if not required.'))
            .addStringOption(option => option.setName('emoted').setDescription('Fourth emote. Leave blank if not required.')),
      async execute(interaction, client) {
            const body = interaction.options.getString('description');
            const emotea = interaction.options.getString('emotea');
            const emoteb = interaction.options.getString('emoteb');
            const emotec = interaction.options.getString('emotec');
            const emoted = interaction.options.getString('emoted');
            
            const message = await interaction.reply({
                  content: body,
                  fetchReply: true
            });

            message.react(emotea);
            if (emoteb !== null) message.react(emoteb);
            if (emotec !== null) message.react(emotec);
            if (emoted !== null) message.react(emoted);
      }
};