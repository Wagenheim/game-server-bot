import { CacheType, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { Ec2AbstractCommand } from "./ec2-abstract-command.js";
import { RebootInstancesCommand } from "@aws-sdk/client-ec2";
import { client, ec2Client } from "../../index.js";
import DiscordMessageErrorHandler from "../../err/discord-message-error-handler.js";
import DiscordInteractionErrorHandler from "../../err/discord-interaction-error-handler.js";
import AwsErrorHandler from "../../err/aws-error-handler.js";

export class RestartCommand extends Ec2AbstractCommand {

    private description = 'restart the server';

    private awsRebootCommand = new RebootInstancesCommand({
        InstanceIds: [process.env.EC2_INSTANCE_ID]
    });

    constructor(name: string){
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            const instanceState = await this.getStatus();
            switch(instanceState) {
                case 'running':
                    if (interaction.user.username !== process.env.DISCORD_ADMIN_USER_NAME) {
                        this.sendReply(interaction, 'Not sure I should be doing this without Kevin...');
                        break;
                    }
                    this.sendReply(interaction, 'Restarting server! Will post the IP when its ready.');
                    await this.restartServer();
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
                    //@KEVIN terminated?
                    this.sendReply(interaction, 'Instance is terminated. Someone should hit up Kevin ASAP.');
                    break;
                default:
                    this.sendReply(interaction, 'Instance state not recognized. Someone should hit up Kevin.');
                    break;
            }
        } catch (error){
            const discordError = new DiscordInteractionErrorHandler('RestartCommand.execute()', interaction, error);
            discordError.handle();
        }
    }

    private async restartServer(): Promise<void> { 
    
        try {
            const response = await ec2Client.send(this.awsRebootCommand);
            if (response.$metadata.httpStatusCode !== 200) {
                throw new AwsErrorHandler(response, 'RestartCommand.restartServer()');
            }
        } catch (error) {
            if (error instanceof AwsErrorHandler) {
                error.handle();
            } else {
                console.log(error);
            }
        }

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
                        const discordError = new DiscordMessageErrorHandler('RestartCommand.execute()', channel, error);
                        discordError.handle();
                    }
                });
            }, 60000);
        });
    }

}