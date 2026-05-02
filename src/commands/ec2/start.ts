import { CacheType, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { AbstractCommand } from "../utility/abstract-command.js";
import { client } from "../../index.js";
import DiscordInteractionErrorHandler from "../../err/discord-interaction-error-handler.js";
import DiscordMessageErrorHandler from "../../err/discord-message-error-handler.js";
import { config } from "../../util/config.js";
import { adapter } from "../../index.js";
import { ec2Instance } from "../../util/aws/ec2-instance.js";

export class StartCommand extends AbstractCommand {

    private description = 'start up the server';

    constructor(name: string){
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            const instanceState = await ec2Instance.getStatus();
            switch(instanceState) {
                case 'running':
                    const publicIp = await ec2Instance.getIp();
                    const reply = adapter.ipIncludesPort ? `${publicIp}:${adapter.gamePort}` : `${publicIp}`;
                    this.sendReply(interaction, `Server is already running on ${reply}`);
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
                    //@KEVIN terminated?
                    this.sendReply(interaction, 'Instance is terminated. Someone should hit up Kevin ASAP.');
                    break;
                default:
                    this.sendReply(interaction, 'Instance state not recognized. Someone should hit up Kevin.');
                    break;
            }
        } catch (error){
            const discordError = new DiscordInteractionErrorHandler('StartCommand.execute()', interaction, error);
            discordError.handle();
        }
    }

    private async startInstance(): Promise<void> {
        await ec2Instance.start();
        return new Promise<void>(() => {
            setTimeout(() => {
                const channel = client.channels.cache.get(config.DISCORD_CHANNEL_ID) as TextChannel;
                ec2Instance.getIp().then(ip => {
                    try {
                        if (ip) {
                            const reply = adapter.ipIncludesPort ? `${ip}:${adapter.gamePort}` : `${ip}`;
                            channel.send(`Server up and running on ${reply}`);
                        } else {
                            channel.send('No IP after 2 minutes. Run /status to see whats going on.');
                        }
                    } catch (error) {
                        const discordError = new DiscordMessageErrorHandler('GetIpCommand.execute()', channel, error);
                        discordError.handle();
                    }
                });
            }, 120000);
        });
    }

}