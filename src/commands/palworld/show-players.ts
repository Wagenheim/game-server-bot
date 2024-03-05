import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { AbstractPalworldCommand } from "./palworld-abstract-command.js";
import DiscordInteractionErrorHandler from "../../err/discord-interaction-error-handler.js";
import palRconClient from "../../util/rcon-client.js";

export class ShowPlayersCommand extends AbstractPalworldCommand{

    private description = 'show current player count'

    constructor(name: string) {
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {

            const instanceState = await this.getStatus();

            if (instanceState !== 'running') {
                interaction.reply('Instance is not running, run /status to see whats going on.');
                return;
            }

            const rconClient = await new palRconClient().connect();
            await interaction.deferReply();
            let response = '';
            response = await rconClient.cmd('ShowPlayers');
            if (response) {
                const cleanList = response
                                .replace(/[a-z]*,[a-z]*,[a-z]*\n/, '')
                                .replace(/,\d*,\d*/g, '')
                                .trim()
                                .split('\n');

                if (cleanList[0] && cleanList.length > 0) {
                    await interaction.editReply("```" + cleanList + "```");
                } else {
                    await interaction.editReply('The server is currently empty.');
                }
            } else {
                await interaction.editReply("Show players command failed, is Kevin connected?");
            }
        } catch (error) {
            const discordError = new DiscordInteractionErrorHandler('ShowPlayersCommand.execute()', interaction, error);
            discordError.handle();
        }
    }
}