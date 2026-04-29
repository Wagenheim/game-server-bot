import {
    DescribeInstancesCommand,
    Instance,
    InstanceStateName,
    RebootInstancesCommand,
    StartInstancesCommand,
    StopInstancesCommand,
} from '@aws-sdk/client-ec2';
import { ec2Client } from './ec2-client.js';
import { config } from '../config.js';

class Ec2Instance {
    private cachedInstance: Instance | undefined;
    private describeCommand = new DescribeInstancesCommand({
        Filters: [{ Name: 'instance-id', Values: [config.EC2_INSTANCE_ID] }]
    });
    private startCommand = new StartInstancesCommand({
        InstanceIds: [config.EC2_INSTANCE_ID]
    });
    private stopCommand = new StopInstancesCommand({
        InstanceIds: [config.EC2_INSTANCE_ID]
    });
    private rebootCommand = new RebootInstancesCommand({
        InstanceIds: [config.EC2_INSTANCE_ID]
    });

    public async describeInstance(): Promise<void> {
        const response = await ec2Client.send(this.describeCommand);
        const instance = response.Reservations?.[0]?.Instances?.[0];
        if (!instance) {
            throw new Error('Could not retrieve EC2 instance');
        }
        this.cachedInstance = instance;
    }

    public async getStatus(): Promise<InstanceStateName> {
        await this.describeInstance();
        const stateName = this.cachedInstance?.State?.Name;
        if (!stateName) {
            throw new Error('Could not retrieve instance state');
        }
        return stateName;
    }

    public async getIp(): Promise<string> {
        await this.describeInstance();
        if (this.cachedInstance?.State?.Name !== 'running') {
            return '';
        }
        return this.cachedInstance.PublicIpAddress ?? '';
    }

    public async start(): Promise<void> {
        const response = await ec2Client.send(this.startCommand);
        if (response.$metadata.httpStatusCode !== 200) {
            throw new Error('EC2 start request failed');
        }
    }

    public async stop(): Promise<void> {
        const response = await ec2Client.send(this.stopCommand);
        if (response.$metadata.httpStatusCode !== 200) {
            throw new Error('EC2 stop request failed');
        }
    }

    public async reboot(): Promise<void> {
        const response = await ec2Client.send(this.rebootCommand);
        if (response.$metadata.httpStatusCode !== 200) {
            throw new Error('EC2 reboot request failed');
        }
    }
}

export const ec2Instance = new Ec2Instance();
