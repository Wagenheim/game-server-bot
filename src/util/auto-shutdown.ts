import { ec2Instance } from './aws/ec2-instance.js';
import { executeRconCommand } from './rcon.js';
import { adapter, client } from '../index.js';
import { config } from './config.js';

const POLL_INTERVAL_MS = 30 * 60 * 1000;
const SHUTDOWN_DELAY_MS = 30 * 60 * 1000;

async function notify(message: string): Promise<void> {
    try {
        const channel = await client.channels.fetch(config.DISCORD_CHANNEL_ID);
        if (channel && channel.isTextBased() && 'send' in channel) {
            await channel.send(message);
        }
    } catch {}
}

async function checkForPlayers(): Promise<number | null> {
    const status = await ec2Instance.getStatus();
    if (status !== 'running') return null;

    let response = '';
    try {
        response = await executeRconCommand(adapter.rcon.listPlayersCommand);
    } catch {
        return null;
    }

    if (!response) return null;

    return adapter.rcon.parsePlayerNames(response).length;
}

async function shutdownIfStillEmpty(): Promise<void> {
    const playerCount = await checkForPlayers();
    if (playerCount === null || playerCount > 0) return;

    await ec2Instance.stop();
    await notify('Server has been shut down.')
}

async function tick(): Promise<void> {
    const playerCount = await checkForPlayers();
    if (playerCount === null || playerCount > 0) return;

    await notify(
        'No players were found on the server. If there is no one on the server in 30 minutes from now, it will be shut down.'
    );

    setTimeout(shutdownIfStillEmpty, SHUTDOWN_DELAY_MS);
}

export function startAutoShutdown(): void {
    function schedule(): void {
        setTimeout(async () => {
            await tick();
            schedule();
        }, POLL_INTERVAL_MS);
    }
    schedule();
    console.log('Auto-shutdown poll started');
}
