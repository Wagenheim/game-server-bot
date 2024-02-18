import { CacheType, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { Ec2AbstractCommand } from "./ec2-abstract-command.js";
import { StartInstancesCommand } from "@aws-sdk/client-ec2";
import { ec2Client } from "../../index.js";
import { client } from "../../index.js"

export class StatusCommand extends Ec2AbstractCommand {

    private description = 'start up the server';

    constructor(name: string){
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            const instanceState = await this.getStatus();
            switch(instanceState) {
                case 'running':
                case 'stopped':
                case 'pending':
                case 'shutting-down':
                case 'stopping':
                    this.sendReply(interaction, `Server is currently ${instanceState}.`);
                    break;
                case 'terminated':
                    this.sendReply(interaction, 'Instance is terminated. Someone should hit up Kevin ASAP.');
                    break;
                default:
                    this.sendReply(interaction, 'Instance state not recognized. Someone should hit up Kevin.');
                    break;
            }
        } catch (error){
            // new ErrorHandler(error.message, 'StartCommand', '/start');
            console.log(error);
        }
    }

}