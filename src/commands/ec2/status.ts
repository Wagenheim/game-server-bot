import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { AbstractCommand } from "../utility/abstract-command.js";
import DiscordInteractionErrorHandler from "../../err/discord-interaction-error-handler.js";
import { ec2Instance } from "../../util/aws/ec2-instance.js";

export class StatusCommand extends AbstractCommand {

    private description = 'get the status of the server';

    constructor(name: string){
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            const instanceState = await ec2Instance.getStatus();
            switch(instanceState) {
                case 'running':
                case 'stopped':
                case 'pending':
                case 'shutting-down':
                case 'stopping':
                    this.sendReply(interaction, `Server is currently ${instanceState}.`);
                    break;
                case 'terminated':
                    //@KEVIN terminated?
                    this.sendReply(interaction, 'Instance is terminated. Someone should hit up Kevin ASAP.');
                    break;
                default:
                    this.sendReply(interaction, 'Instance state not recognized. Someone should hit up Kevin.');
                    break;
            }
        } catch (error){
            const discordError = new DiscordInteractionErrorHandler('StatusCommand.execute()', interaction, error);
            discordError.handle();
        }
    }

}