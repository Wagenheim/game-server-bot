import { GameAdapter } from './game-adapter.js';
import { loadScript } from '../util/load-scripts.js';

// Minecraft `list` returns: "There are N of a max of M players online: name1, name2"
// Empty form: "There are 0 of a max of M players online:"
function parseMinecraftPlayers(response: string): string[] {
    const colonIdx = response.indexOf(':');
    if (colonIdx === -1) return [];
    const tail = response.substring(colonIdx + 1).trim();
    if (!tail) return [];
    return tail.split(',').map(name => name.trim()).filter(name => name.length > 0);
}

export function createMinecraftAdapter(): GameAdapter {
    return {
        name: 'Minecraft',
        gamePort: 25565,
        ipIncludesPort: false,
        rcon: {
            listPlayersCommand: 'list',
            parsePlayerNames: parseMinecraftPlayers,
        },
        serverScripts: {
            start: loadScript('minecraft', 'start'),
            stop: loadScript('minecraft', 'stop'),
            backup: loadScript('minecraft', 'backup'),
            update: loadScript('minecraft', 'update'),
        },
    };
}
