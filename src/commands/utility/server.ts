import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { AbstractCommand } from "./abstract-command.js";

/**
 * An example command I used to test with.
 * 
 * It just returns the name of the discord server.
 */
export class ServerCommand extends AbstractCommand {

    private description = 'This is a test command.'

    constructor(name: string){
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        await interaction.reply(`Server name: ${interaction.guild?.name ?? 'unknown (DM)'}`);
    }

}