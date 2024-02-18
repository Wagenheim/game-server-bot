import { AbstractCommand } from "../utility/abstract-command";
import { ec2Client } from "../../index.js";
import { DescribeInstancesCommand, Instance, InstanceStateName } from "@aws-sdk/client-ec2";
import ErrorHandler from "../../err/error";

export abstract class Ec2AbstractCommand extends AbstractCommand {
    private instance: Instance;
    constructor(name: string) {
        super(name);
    }
    private async describeInstance(): Promise<void> {
        const command = new DescribeInstancesCommand({
            Filters: [
                {
                    Name: 'instance-id', 
                    Values: [process.env.EC2_INSTANCE_ID]
                }
            ]
        });
        try {
            const response = await ec2Client.send(command);
            this.instance = response.Reservations[0].Instances[0];
        } catch (error) {
            // new ErrorHandler(error.message, 'Ec2AbstractCommand', '');
            console.log(error);
        }
    }
    public async getStatus(): Promise<InstanceStateName> {
        await this.describeInstance();
        return this.instance.State.Name;
    }
    public async getIp(): Promise<string> {
        const status = await this.getStatus();
        if (status === 'running') {
            return this.instance.PublicIpAddress;
        } else {
            return '';
        }
        
    }
}