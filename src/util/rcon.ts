/**
 * Connects to the game server's RCON, runs a single command, and disconnects.
 * Each call is a fresh connection — the server's IP can change after restarts,
 * so caching a socket isn't safe.
 *
 * rcon-srcds ships as CJS with d.ts using `export default`. Under module:nodenext
 * TS resolves the import to the namespace rather than the class, so we re-type
 * the surface we actually use. Node's __esModule flag handles the unwrap at runtime.
 */
import RconImport from 'rcon-srcds';
import { config } from './config.js';
import { ec2Instance } from './aws/ec2-instance.js';

type RconClient = {
    authenticate(password: string): Promise<boolean>;
    execute(command: string): Promise<string | boolean>;
    disconnect(): Promise<void>;
};
const Rcon = RconImport as unknown as new (opts: { host: string; port: number }) => RconClient;

export async function executeRconCommand(command: string): Promise<string> {
    const host = await ec2Instance.getIp();
    if (!host) {
        throw new Error('Cannot run RCON command: instance has no public IP');
    }

    const rcon = new Rcon({ host, port: config.RCON_PORT });
    try {
        await rcon.authenticate(config.RCON_PASSWORD);
        const result = await rcon.execute(command);
        return typeof result === 'string' ? result : '';
    } finally {
        try {
            await rcon.disconnect();
        } catch {
            // socket may already be closed; nothing to do
        }
    }
}
