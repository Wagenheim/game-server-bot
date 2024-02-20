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
            const rconClient = await new palRconClient().connect();
            const response = await rconClient.cmd('ShowPlayers');
            if (response) {
                const lineOneRegex = /[a-z]*,[a-z]*,[a-z]*\n/;
                const lineOneTrim = response.replace(lineOneRegex, '');
                if (lineOneTrim === '') {
                    this.sendReply(interaction, 'Server is empty!');
                } else {
                    const suffixRegex = /,\d*,\d*/g;
                    const playerList = lineOneTrim.replace(suffixRegex, '');
                    this.sendReply(interaction, "```" + playerList + "```");
                }
            }
            await rconClient.close();
        } catch (error) {
            const discordError = new DiscordInteractionErrorHandler('ShowPlayersCommand.execute()', interaction, error);
            discordError.handle();
            this.sendReply(interaction, 'Kev, are you running me locally and connected to the game?');
        }
    }
}