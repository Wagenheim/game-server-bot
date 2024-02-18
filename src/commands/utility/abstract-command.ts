import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

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
        await interaction.reply(`Execute function still needs to be implemented.`);
    }
    public sendReply(interaction: ChatInputCommandInteraction<CacheType>, message: string): void {
        interaction.reply(message);
    }
}