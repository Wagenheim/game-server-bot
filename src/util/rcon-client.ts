import { client } from '../index.js';
import { RconClient, RconConnectOptions } from 'rcon-client';
import RconClientErrorHandler from '../err/rcon-client-error-handler.js';
import { TextChannel } from 'discord.js';
import DiscordMessageErrorHandler from '../err/discord-message-error-handler.js';
import { config } from './config.js';
import { ec2Instance } from './aws/ec2-instance.js';

/**
 * https://github.com/janispritzkau/rcon-client/issues/25
 *
 * 2/19/2024
 * Need to change line 75 of node_modules/rcon-client/dist/client.js
 * from:
 * const reqId = this.#nextReqId();
 * to:
 * const reqId = 0;
 *
 * & point ts-config to root ts-config
 */

export default class palRconClient {
    private rconConfig: RconConnectOptions = {
        host: '',
        port: config.RCON_PORT,
        password: config.RCON_PASSWORD
    };

    public async connect(): Promise<RconClient> {
        const ip = await ec2Instance.getIp();
        this.rconConfig.host = ip;
        try {
            if (this.rconConfig.host) {
                return RconClient.connect(this.rconConfig);
            }
        } catch (error) {
            const rconClientError = new RconClientErrorHandler('RconClient.connect()', error);
            rconClientError.handle();
        }
        throw new Error('Could not connect to RCON');
    }

    public async stopInstance(): Promise<void> {
        await ec2Instance.stop();

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const channel = client.channels.cache.get(config.DISCORD_CHANNEL_ID) as TextChannel;
                ec2Instance.getStatus().then(status => {
                    try {
                        if (status === 'stopped') {
                            channel.send('Server has been stopped.');
                        } else {
                            channel.send('Sever hasnt entered stopped state in 1 minutes. Run /status to see what its doing.');
                        }
                        resolve();
                    } catch (error) {
                        const discordError = new DiscordMessageErrorHandler('palRconClient.stopInstance()', channel, error);
                        discordError.handle();
                    }
                });
            }, 60000);
        });
    }
}
