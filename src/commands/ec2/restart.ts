import { CacheType, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { AbstractCommand } from "../utility/abstract-command.js";
import { client } from "../../index.js";
import DiscordMessageErrorHandler from "../../err/discord-message-error-handler.js";
import DiscordInteractionErrorHandler from "../../err/discord-interaction-error-handler.js";
import { config } from "../../util/config.js";
import { adapter } from "../../index.js";
import { ec2Instance } from "../../util/aws/ec2-instance.js";

export class RestartCommand extends AbstractCommand {

    private description = 'restart the server';

    constructor(name: string){
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            const instanceState = await ec2Instance.getStatus();
            switch(instanceState) {
                case 'running':
                    if (interaction.user.username !== config.DISCORD_ADMIN_USER_NAME) {
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
        await ec2Instance.reboot();
        return new Promise<void>(() => {
            setTimeout(() => {
                const channel = client.channels.cache.get(config.DISCORD_CHANNEL_ID) as TextChannel;
                ec2Instance.getIp().then(ip => {
                    try {
                        if (ip) {
                            const reply = adapter.ipIncludesPort ? `${ip}:${adapter.gamePort}` : `${ip}`;
                            channel.send(`Server back up on ${reply}.`);
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