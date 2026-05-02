import { GameAdapter } from './game-adapter.js';
import { loadScript } from '../util/load-scripts.js';

function parsePalworldPlayers(response: string): string[] {
    return response
        .replace(/[a-z]*,[a-z]*,[a-z]*\n/, '')
        .replace(/,\d*,\d*/g, '')
        .trim()
        .split('\n')
        .filter(name => name.length > 0);
}

export function createPalworldAdapter(): GameAdapter {
    return {
        name: 'Palworld',
        gamePort: 8211,
        ipIncludesPort: true,
        rcon: {
            listPlayersCommand: 'ShowPlayers',
            parsePlayerNames: parsePalworldPlayers,
        },
        serverScripts: {
            start: loadScript('palworld', 'start'),
            stop: loadScript('palworld', 'stop'),
            backup: loadScript('palworld', 'backup'),
            update: loadScript('palworld', 'update'),
        },
    };
}
