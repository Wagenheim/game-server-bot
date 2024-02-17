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

    public async execute(interaction: any): Promise<void> {
        await interaction.reply(`Server name: ${interaction.guild.name}`);
    }

}