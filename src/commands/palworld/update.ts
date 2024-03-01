import { CacheType, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { AbstractPalworldCommand } from "./palworld-abstract-command.js";
import DiscordInteractionErrorHandler from "../../err/discord-interaction-error-handler.js";
import SshClient from "../../util/ssh-client.js";
import { client } from "../../index.js";
import SshClientErrorHandler from "../../err/ssh-client-error-handler.js";
import DiscordMessageErrorHandler from "../../err/discord-message-error-handler.js";

export default class UpdateCommand extends AbstractPalworldCommand {

    private description = 'update the server';
    private channel: TextChannel;
    private ip: string;

    constructor(name: string) {
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            this.channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID) as TextChannel;
            this.sendReply(interaction, 'Starting update process. I will be stopping the server shortly');
            await this.updatePalworldServer();
        } catch (error) {
            const discordError = new DiscordInteractionErrorHandler('UpdateCommand.execute()', interaction, error);
            discordError.handle();
            console.log(error);
        }
    }

    private async updatePalworldServer(): Promise<void> {
        const instanceStatus = await this.getStatus();
        if (instanceStatus === 'running') {
            this.ip = await this.getIp();
            try {
                this.channel.send('Stopping the server for update...');
            } catch (error) {
                throw new DiscordMessageErrorHandler('UpdateCommand.stopPalworldServer()', this.channel, error).handle();
            }
            return new Promise<void>((resolve) => {
                try {
                    const sshClient = new SshClient(this.ip, process.env.EC2_MAIN_USER);
                    sshClient.getSSH().exec(
                        process.env.EC2_STOP_PALWORLD,
                        {
                            exit: (code, sdtout, stderr) => {
                                if (code === 0) {
                                    this.channel.send('Updating the server...');
                                    sshClient.getSSH().exec(
                                        process.env.EC2_PALWORLD_UPDATE,
                                        {
                                            exit: (code, sdtout, stderr) => {
                                                if (code === 0) {
                                                    this.channel.send('Update complete, Restarting the server...');
                                                    sshClient.getSSH().exec(
                                                        process.env.EC2_START_PALWORLD,
                                                        {
                                                            exit: (code, sdtout, stderr) => {
                                                                if (code === 0) {
                                                                    this.channel.send(`Restarted the server. Wait like 1-2 minutes before trying to connect. IP: ${this.ip}:8211`);
                                                                } else {
                                                                    throw new SshClientErrorHandler('UpdateCommand.updatePalworldServer()', stderr);
                                                                }
                                                            }
                                                        }
                                                    )
                                                } else {
                                                    throw new SshClientErrorHandler('UpdateCommand.stopPalworldServer()', stderr);
                                                }
                                            }
                                        }
                                    )
                                } else {
                                    throw new SshClientErrorHandler('UpdateCommand.updatePalworldServer()', stderr);
                                }
                            } 
                        }
                    );

                    sshClient.runCommands(
                        () => {
                            resolve();
                        },
                        (error) => {
                            throw new SshClientErrorHandler('UpdateCommand.updatePalworldServer()', error);
                        }
                    );

                } catch (error) {
                    if (error instanceof SshClientErrorHandler) {
                        error.handle();
                    }
                }
            }); 
        } else {
            this.channel.send('Server is currently not running. Run /status to see whats up.');
        }
    }

}