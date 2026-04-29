import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { AbstractGameCommand } from "../abstract-game-command.js";
import DiscordInteractionErrorHandler from "../../err/discord-interaction-error-handler.js";
import palRconClient from "../../util/rcon-client.js";
import { adapter } from "../../index.js";
import { ec2Instance } from "../../util/aws/ec2-instance.js";

export class ShowPlayersCommand extends AbstractGameCommand {

    private description = 'show current player count'

    constructor(name: string) {
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {

            const instanceState = await ec2Instance.getStatus();

            if (instanceState !== 'running') {
                interaction.reply('Instance is not running, run /status to see whats going on.');
                return;
            }

            const rconClient = await new palRconClient().connect();
            await interaction.deferReply();
            let response = '';
            response = await rconClient.cmd(adapter.rcon.listPlayersCommand);
            if (response) {
                const cleanList = adapter.rcon.parsePlayerNames(response);

                if (cleanList.length > 0) {
                    await interaction.editReply("```" + cleanList.join('\n') + "```");
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