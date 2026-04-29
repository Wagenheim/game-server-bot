import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { AbstractCommand } from "../utility/abstract-command.js";
import DiscordInteractionErrorHandler from "../../err/discord-interaction-error-handler.js";
import { adapter } from "../../index.js";
import { ec2Instance } from "../../util/aws/ec2-instance.js";

export class GetIpCommand extends AbstractCommand {

    private description = 'grab the IP of the server';

    constructor(name: string){
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            const status = await ec2Instance.getStatus();
            if (status === 'stopped') {
                this.sendReply(interaction, 'The server is currently offline. Try running with /start.');
            }
            const publicIp = await ec2Instance.getIp();
            if (publicIp) {
                this.sendReply(interaction, `${publicIp}:${adapter.gamePort}`);
            } else {
                this.sendReply(interaction, 'Currently no public IP. Run /status to see whats going on.');
            }
            //@KEVIN terminated?
        } catch (error) {
            const discordError = new DiscordInteractionErrorHandler('GetIpCommand.execute()', interaction, error);
            discordError.handle();
        }
    }

}