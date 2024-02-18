import { DescribeInstancesCommandOutput } from "@aws-sdk/client-ec2";
import ErrorHandlerAbstract from "./abstract-error-handler.js";
import { CacheType, ChatInputCommandInteraction } from "discord.js";

export default class AwsErrorHandler extends ErrorHandlerAbstract {
    constructor(
        response: DescribeInstancesCommandOutput, 
        functionName: string,
        interaction?: ChatInputCommandInteraction<CacheType>
    ) {
        super();
        this.adminMessage = `
            A non-200 response came back from AWS.
            Command: ${interaction ? interaction.commandName : 'N/A'}.
            Function: ${functionName}.
            HttpCode: ${response.$metadata.httpStatusCode}.
            Request ID: ${response.$metadata.requestId}.
        `    
    }
}