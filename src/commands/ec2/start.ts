import { CacheType, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { Ec2AbstractCommand } from "./ec2-abstract-command.js";
import { StartInstancesCommand } from "@aws-sdk/client-ec2";
import { ec2Client } from "../../index.js";
import { client } from "../../index.js"

export class StartCommand extends Ec2AbstractCommand {

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
                    const publicIp = await this.getIp();
                    this.sendReply(interaction, `Server is already running on ${publicIp}:8211`);
                    break;
                case 'stopped':
                    this.sendReply(interaction, `Starting up! Will post the IP here when its ready.`);
                    await this.startInstance();
                    break;
                case 'pending':
                case 'shutting-down':
                case 'stopping':
                    this.sendReply(interaction, `Server is currently ${instanceState}. Try again in a few minutes`);
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

    private async startInstance(): Promise<void> {
        const command = new StartInstancesCommand({
            InstanceIds: [process.env.EC2_INSTANCE_ID]
        });
        await ec2Client.send(command);
        return new Promise<void>(() => {
            setTimeout(() => {
                const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID) as TextChannel;
                this.getIp().then(ip => {
                    try {
                        if (ip) {
                            channel.send(`Server up and running on ${ip}:8211`);
                        } else {
                            channel.send('No IP after 2 minutes. Run /status to see whats going on.');
                        }
                    } catch (error) {
                        // new ErrorHandler(error.message, 'StartCommand', '/start');
                        console.log(error);
                    }
                });
            }, 120000);
        });
    }

}