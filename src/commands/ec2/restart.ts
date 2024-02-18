import { CacheType, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { Ec2AbstractCommand } from "./ec2-abstract-command.js";
import { RebootInstancesCommand } from "@aws-sdk/client-ec2";
import { client, ec2Client } from "../../index.js";

export class RestartCommand extends Ec2AbstractCommand {

    private description = 'restart the server';

    constructor(name: string){
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            const instanceState = await this.getStatus();
            switch(instanceState) {
                case 'running':
                    //Need to give aws permissions 
                    this.sendReply(interaction, `Kevin needs to give me AWS permissions to run /${interaction.commandName}.`);
                    // this.sendReply(interaction, 'Restarting server! Will post the IP when its ready.');
                    // await this.restartServer();
                    break;
                case 'stopped':
                    this.sendReply(interaction, 'Server is currently stopped. Run /start to boot it up!');
                    break;
                case 'pending':
                case 'shutting-down':
                case 'stopping':
                    this.sendReply(interaction, `Server is currently ${instanceState}. Wait a few minutes and run /status.`);
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

    private async restartServer(): Promise<void> {
        const command = new RebootInstancesCommand({
            InstanceIds: [process.env.EC2_INSTANCE_ID]
        });
        await ec2Client.send(command);
        return new Promise<void>(() => {
            setTimeout(() => {
                const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID) as TextChannel;
                this.getIp().then(ip => {
                    try {
                        if (ip) {
                            channel.send(`Server back up on ${ip}:8211.`);
                        } else {
                            channel.send('Sever doesnt\'t have an IP after 1 minute. Run /status to see what its doing.');
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