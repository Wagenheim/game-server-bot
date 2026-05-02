import { CacheType, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { AbstractGameCommand } from "../abstract-game-command.js";
import { ec2Instance } from "../../util/aws/ec2-instance.js";
import { runShellScript } from "../../util/aws/ssm-runner.js";
import DiscordInteractionErrorHandler from "../../err/discord-interaction-error-handler.js";
import { client } from "../../index.js";
import { config } from "../../util/config.js";
import { adapter } from "../../index.js";

export default class BackupCommand extends AbstractGameCommand {

    private description = 'backup the server';

    constructor(name: string) {
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            const channel = client.channels.cache.get(config.DISCORD_CHANNEL_ID) as TextChannel;
            this.sendReply(interaction, 'Starting backup process. I will be stopping the server shortly');
            await this.backupGameServer(channel);
        } catch (error) {
            const discordError = new DiscordInteractionErrorHandler('BackupCommand.execute()', interaction, error);
            discordError.handle();
        }
    }

    private async backupGameServer(channel: TextChannel): Promise<void> {
        const instanceStatus = await ec2Instance.getStatus();
        if (instanceStatus !== 'running') {
            channel.send('Server is currently not running. Run /status to see whats up.');
            return;
        }

        const ip = await ec2Instance.getIp();

        channel.send('Stopping the server for Backup...');
        await runShellScript(adapter.serverScripts.stop);

        channel.send('Server stopped, starting backup...');
        await runShellScript(adapter.serverScripts.backup);

        channel.send('Backup complete, restarting...');
        await runShellScript(adapter.serverScripts.start);

        setTimeout(() => {
            const reply = adapter.ipIncludesPort ? `${ip}:${adapter.gamePort}` : `${ip}`;
            channel.send(`Restarted the server. IP: ${reply}`);
        }, 120000);
    }

}
