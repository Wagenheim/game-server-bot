/**
 * Runs a shell script on the configured EC2 instance via SSM.
 * Replaces the legacy SSH-based remote execution.
 */
import {
    SendCommandCommand,
    GetCommandInvocationCommand,
} from '@aws-sdk/client-ssm';
import { ssmClient } from './ssm-client.js';
import { config } from '../config.js';

const POLL_INTERVAL_MS = 2000;
const MAX_WAIT_MS = 30 * 60 * 1000;

export async function runShellScript(script: string): Promise<string> {
    const sent = await ssmClient.send(new SendCommandCommand({
        InstanceIds: [config.EC2_INSTANCE_ID],
        DocumentName: 'AWS-RunShellScript',
        Parameters: { commands: [script] },
    }));

    const commandId = sent.Command?.CommandId;
    if (!commandId) {
        throw new Error('SSM SendCommand did not return a CommandId');
    }

    const deadline = Date.now() + MAX_WAIT_MS;
    while (Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

        let result;
        try {
            result = await ssmClient.send(new GetCommandInvocationCommand({
                CommandId: commandId,
                InstanceId: config.EC2_INSTANCE_ID,
            }));
        } catch (error: any) {
            if (error?.name === 'InvocationDoesNotExist') {
                continue;
            }
            throw error;
        }

        const status = result.Status;
        if (status === 'Pending' || status === 'InProgress' || status === 'Delayed') {
            continue;
        }
        if (status === 'Success') {
            return result.StandardOutputContent ?? '';
        }
        throw new Error(
            `SSM command ${commandId} ended with status ${status}: ${result.StandardErrorContent ?? ''}`
        );
    }

    throw new Error(`SSM command ${commandId} did not complete within ${MAX_WAIT_MS}ms`);
}
