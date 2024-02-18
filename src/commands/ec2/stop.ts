import { CacheType, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { Ec2AbstractCommand } from "./ec2-abstract-command.js";
import { StopInstancesCommand } from "@aws-sdk/client-ec2";
import { ec2Client } from "../../index.js";
import { client } from "../../index.js"

export class StopCommand extends Ec2AbstractCommand {

    private description = 'stop the server';

    constructor(name: string){
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            const instanceState = await this.getStatus();
            switch(instanceState) {
                case 'stopped':
                    this.sendReply(interaction, 'Instance is already stopped.');
                    break;
                case 'running': 
                    this.sendReply(interaction, 'Shutting server down...');
                    await this.stopInstance();
                    break;
                case 'pending':
                case 'shutting-down':
                case 'stopping':
                    this.sendReply(interaction, `Server is currently ${instanceState}. Try running /status in a few minutes.`);
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

    private async stopInstance(): Promise<void> {
        const command = new StopInstancesCommand({
            InstanceIds: [process.env.EC2_INSTANCE_ID]
        });
        await ec2Client.send(command);
        return new Promise<void>(() => {
            setTimeout(() => {
                const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID) as TextChannel;
                this.getStatus().then(status => {
                    try {
                        if (status === 'stopped') {
                            channel.send('Server has been stopped.');
                        } else {
                            channel.send('Sever hasnt entered stopped state in 1 minutes. Run /status to see what its doing.');
                        }
                    } catch (error) {
                        // new ErrorHandler(error.message, 'StartCommand', '/start');
                        console.log(error);
                    }
                });
            }, 60000);
        });
    }

}