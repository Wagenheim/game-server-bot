import { 
    CacheType, 
    ChatInputCommandInteraction, 
    InteractionReplyOptions, 
    MessagePayload, 
    SlashCommandBuilder 
} from "discord.js";
import DiscordInteractionErrorHandler from "../../err/discord-interaction-error-handler.js";

export type ReplyMessageType = string | InteractionReplyOptions | MessagePayload;

/**
 * Abstract class for creating a new function.
 * Includes creating the command with SlashCommandBuilder
 * 
 * To create a new command:
 * 1. Extend this class and implement a new execute()
 * 2. Add a case with the command name to ./src/util/command-factory.ts
 * 3. Add the string to the arrat in ./src/index.ts
 */
export abstract class AbstractCommand {
    private command: SlashCommandBuilder;
    constructor(name: string) {
        this.command = new SlashCommandBuilder().setName(name);
    }
    public getCommand(): SlashCommandBuilder {
        return this.command;
    }
    public hasCommand(): boolean {
        return !!this.command;
    }
    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            await interaction.reply(`Execute function still needs to be implemented.`);
        } catch (error) {
            const discordError = new DiscordInteractionErrorHandler('AbstractCommand.execute()', interaction, error);
            discordError.handle();
        }
    }
    public sendReply(interaction: ChatInputCommandInteraction<CacheType>, message: ReplyMessageType): void {
        try {
            interaction.reply(message);
        } catch (error) {
            const discordError = new DiscordInteractionErrorHandler('AbstractCommand.sendReply()', interaction, error);
            discordError.handle();
        }
    }
}