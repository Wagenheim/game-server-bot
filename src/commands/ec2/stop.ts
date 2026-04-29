import { CacheType, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { AbstractCommand } from "../utility/abstract-command.js";
import { client } from "../../index.js";
import DiscordInteractionErrorHandler from "../../err/discord-interaction-error-handler.js";
import DiscordMessageErrorHandler from "../../err/discord-message-error-handler.js";
import { config } from "../../util/config.js";
import { ec2Instance } from "../../util/aws/ec2-instance.js";

export class StopCommand extends AbstractCommand {

    private description = 'stop the server';

    constructor(name: string){
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            const instanceState = await ec2Instance.getStatus();
            switch(instanceState) {
                case 'stopped':
                    this.sendReply(interaction, 'Instance is already stopped.');
                    break;
                case 'running':
                    if (interaction.user.username !== config.DISCORD_ADMIN_USER_NAME) {
                        this.sendReply(interaction, 'Not sure I should be doing this without Kevin...');
                        break;
                    }
                    this.sendReply(interaction, 'Shutting server down...');
                    await this.stopInstance();
                    break;
                case 'pending':
                case 'shutting-down':
                case 'stopping':
                    this.sendReply(interaction, `Server is currently ${instanceState}. Try running /status in a few minutes.`);
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
            const discordError = new DiscordInteractionErrorHandler('StopCommand.execute()', interaction, error);
            discordError.handle();
        }
    }

    private async stopInstance(): Promise<void> {
        await ec2Instance.stop();
        return new Promise<void>(() => {
            setTimeout(() => {
                const channel = client.channels.cache.get(config.DISCORD_CHANNEL_ID) as TextChannel;
                ec2Instance.getStatus().then(status => {
                    try {
                        if (status === 'stopped') {
                            channel.send('Server has been stopped.');
                        } else {
                            channel.send('Sever hasnt entered stopped state in 1 minutes. Run /status to see what its doing.');
                        }
                    } catch (error) {
                        const discordError = new DiscordMessageErrorHandler('GetIpCommand.execute()', channel, error);
                        discordError.handle();
                    }
                });
            }, 60000);
        });
    }

}