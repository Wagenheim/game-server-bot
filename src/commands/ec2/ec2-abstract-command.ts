import { AbstractCommand } from "../utility/abstract-command.js";
import { ec2Client } from "../../index.js";
import { DescribeInstancesCommand, Instance, InstanceStateName } from "@aws-sdk/client-ec2";
import AwsErrorHandler from "../../err/aws-error-handler.js";

export abstract class Ec2AbstractCommand extends AbstractCommand {
    private instance: Instance;
    private awsCommand = new DescribeInstancesCommand({
        Filters: [
            {
                Name: 'instance-id', 
                Values: [process.env.EC2_INSTANCE_ID]
            }
        ]
    });
    constructor(name: string) {
        super(name);
    }
    private async describeInstance(): Promise<void> {
        try {
            const response = await ec2Client.send(this.awsCommand);
            const statusCode = response.$metadata.httpStatusCode; 
            if (statusCode === 200) {
                this.instance = response.Reservations[0].Instances[0];
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