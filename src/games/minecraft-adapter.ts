import { GameAdapter } from './game-adapter.js';
import { loadScript } from '../util/load-scripts.js';

// Minecraft `list` returns: "There are N of a max of M players online: <names>"
// Depending on server software the names are separated by commas, spaces, or
// newlines, and may carry § color codes. Java usernames are [A-Za-z0-9_] (no
// spaces), so splitting on any run of comma/whitespace is safe and delimiter-proof.
function parseMinecraftPlayers(response: string): string[] {
    const clean = response.replace(/§./g, '');   // strip § + format code
    const colonIdx = clean.lastIndexOf(':');          // names follow the last colon
    if (colonIdx === -1) return [];
    const tail = clean.slice(colonIdx + 1).trim();
    if (!tail) return [];
    return tail.split(/[\s,]+/).filter(name => name.length > 0);
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
