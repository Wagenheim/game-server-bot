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
            let response = await rconClient.cmd('ShowPlayers');
            if (response) {
                const cleanList = response
                                .replace(/[a-z]*,[a-z]*,[a-z]*\n/, '')
                                .replace(/,\d*,\d*/g, '')
                                .trim()
                                .split('\n');
                this.sendReply(interaction, "```" + cleanList + "```");
            }
            await rconClient.close();
        } catch (error) {
            const discordError = new DiscordInteractionErrorHandler('ShowPlayersCommand.execute()', interaction, error);
            discordError.handle();
            this.sendReply(interaction, 'Kev, are you running me locally and connected to the game?');
        }
    }
}