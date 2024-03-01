import { DescribeInstancesCommand, Instance, InstanceStateName, StopInstancesCommand } from '@aws-sdk/client-ec2';
import { client, ec2Client } from '../index.js';
import AwsErrorHandler from '../err/aws-error-handler.js';
import { RconClient, RconConnectOptions } from 'rcon-client';
import RconClientErrorHandler from '../err/rcon-client-error-handler.js';
import { TextChannel } from 'discord.js';
import DiscordMessageErrorHandler from '../err/discord-message-error-handler.js';

/**
 * 
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
    private instance: Instance;
    
    private awsCommand = new DescribeInstancesCommand({
        Filters: [
            {
                Name: 'instance-id', 
                Values: [process.env.EC2_INSTANCE_ID]
            }
        ]
    });

    private awsStopCommand = new StopInstancesCommand({
        InstanceIds: [process.env.EC2_INSTANCE_ID]
    });

    private config: RconConnectOptions = {
        host: '', 
        port: Number(process.env.RCON_PORT), 
        password: process.env.RCON_PASSWORD
    };

    constructor(){}

    public async connect(): Promise<RconClient> {
        const ip = await this.getInstanceIp();
        this.config.host = ip;
        try {
            if (this.config.host) {
                return RconClient.connect(this.config);
            }
        } catch (error) {
            const rconClientError = new RconClientErrorHandler('RconClient.connect()', error);
            rconClientError.handle(); 
        }
    }

    private async describeInstance(): Promise<void> {
        try {
            const response = await ec2Client.send(this.awsCommand);
            const statusCode = response.$metadata.httpStatusCode; 
            if (statusCode === 200) {
                this.instance = response.Reservations[0].Instances[0];
            } else {
                throw new AwsErrorHandler(response, 'Ec2AbstractCommand.describeInstance()');
            }
        } catch (error) {
            if (error instanceof AwsErrorHandler) {
                error.handle();
            } else {
                console.log(error);
            }
        }
    }

    public async stopInstance(): Promise<void> {
        
        try {
            const response = await ec2Client.send(this.awsStopCommand);
            if (response.$metadata.httpStatusCode !== 200) {
                throw new AwsErrorHandler(response, 'restartServer()');
            }
        } catch (error) {
            if (error instanceof AwsErrorHandler) {
                error.handle();
            } else {
                console.log(error);
            }
        }
        
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID) as TextChannel;
                this.getInstanceStatus().then(status => {
                    try {
                        if (status === 'stopped') {
                            channel.send('Server has been stopped.');
                        } else {
                            channel.send('Sever hasnt entered stopped state in 1 minutes. Run /status to see what its doing.');
                        }
                        resolve;
                    } catch (error) {
                        const discordError = new DiscordMessageErrorHandler('GetIpCommand.execute()', channel, error);
                        discordError.handle();
                    }
                });
            }, 60000);
        });
    }

    public async getInstanceStatus(): Promise<InstanceStateName> {
        await this.describeInstance();
        return this.instance.State.Name;
    }

    public async getInstanceIp(): Promise<string> {
        const status = await this.getInstanceStatus();
        if (status === 'running') {
            return this.instance.PublicIpAddress;
        } else {
            return '';
        }
    }

}