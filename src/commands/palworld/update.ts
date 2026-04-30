import { CacheType, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { AbstractGameCommand } from "../abstract-game-command.js";
import { ec2Instance } from "../../util/aws/ec2-instance.js";
import { runShellScript } from "../../util/aws/ssm-runner.js";
import DiscordInteractionErrorHandler from "../../err/discord-interaction-error-handler.js";
import { client } from "../../index.js";
import { config } from "../../util/config.js";
import { adapter } from "../../index.js";

export default class UpdateCommand extends AbstractGameCommand {

    private description = 'update the server';

    constructor(name: string) {
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            const channel = client.channels.cache.get(config.DISCORD_CHANNEL_ID) as TextChannel;
            this.sendReply(interaction, 'Starting update process. I will be stopping the server shortly');
            await this.updateGameServer(channel);
        } catch (error) {
            const discordError = new DiscordInteractionErrorHandler('UpdateCommand.execute()', interaction, error);
            discordError.handle();
        }
    }

    private async updateGameServer(channel: TextChannel): Promise<void> {
        const instanceStatus = await ec2Instance.getStatus();
        if (instanceStatus !== 'running') {
            channel.send('Server is currently not running. Run /status to see whats up.');
            return;
        }

        const ip = await ec2Instance.getIp();

        channel.send('Stopping the server for update...');
        await runShellScript(adapter.serverScripts.stop);

        channel.send('Updating...');
        await runShellScript(adapter.serverScripts.update);

        channel.send('Update complete, Restarting...');
        await runShellScript(adapter.serverScripts.start);

        setTimeout(() => {
            channel.send(`Restarted the server. IP: ${ip}:${adapter.gamePort}`);
        }, 120000);
    }

}
