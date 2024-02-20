import { DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { ec2Client } from '../index.js';
import AwsErrorHandler from '../err/aws-error-handler.js';
import { RconClient, RconConnectOptions } from 'rcon-client';
import RconClientErrorHandler from '../err/rcon-client-error-handler.js';

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
 */

export default class palRconClient {

    private awsCommand = new DescribeInstancesCommand({
        Filters: [
            {
                Name: 'instance-id', 
                Values: [process.env.EC2_INSTANCE_ID]
            }
        ]
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
            const rconClientError = new RconClientErrorHandler('', error);
            rconClientError.handle(); 
        }
    }

    private async getInstanceIp(): Promise<string> {
        try {
            const response = await ec2Client.send(this.awsCommand);
            const statusCode = response.$metadata.httpStatusCode; 
            if (statusCode === 200) {
                return response.Reservations[0].Instances[0].PublicIpAddress;
            } else {
                throw new AwsErrorHandler(response, 'describeInstance()');
            }
        } catch (error) {
            if (error instanceof AwsErrorHandler) {
                error.handle();
            } else {                
                console.log(error);
            }
        }
    }

}