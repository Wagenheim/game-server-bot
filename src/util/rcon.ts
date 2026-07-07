/**
 * Connects to the game server's RCON, runs a single command, and disconnects.
 * Each call is a fresh connection — the server's IP can change after restarts,
 * so caching a socket isn't safe.
 *
 * rcon-srcds is CJS (`exports.default = RCON`). Node's ESM interop hands back
 * the whole module.exports namespace for default imports — it does not honor
 * __esModule the way bundlers do — so we unwrap `.default` ourselves.
 */
import RconImport from 'rcon-srcds';
import { config } from './config.js';
import { ec2Instance } from './aws/ec2-instance.js';

type RconClient = {
    authenticate(password: string): Promise<boolean>;
    execute(command: string): Promise<string | boolean>;
    disconnect(): Promise<void>;
};
type RconCtor = new (opts: { host: string; port: number }) => RconClient;
const RconModule = RconImport as unknown as RconCtor & { default?: RconCtor };
const Rcon: RconCtor = RconModule.default ?? RconModule;

const RCON_TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(
            () => reject(new Error(`RCON ${label} timed out`)),
            ms
        );
        promise.then(
            value => {
                clearTimeout(timer);
                resolve(value);
            },
            err => {
                clearTimeout(timer);
                reject(err);
            }
        )
    });
}

export async function executeRconCommand(command: string): Promise<string> {
    const host = await ec2Instance.getIp();
    if (!host) {
        throw new Error('Cannot run RCON command: instance has no public IP');
    }

    const rcon = new Rcon({ host, port: config.RCON_PORT });
    try {
        await withTimeout(rcon.authenticate(config.RCON_PASSWORD), RCON_TIMEOUT_MS, 'authenticate');
        const result = await withTimeout(rcon.execute(command), RCON_TIMEOUT_MS, 'execute');
        return typeof result === 'string' ? result : '';
    } finally {
        try {
            await rcon.disconnect();
        } catch {
            // socket may already be closed; nothing to do
        }
    }
}
