import { GameAdapter } from './game-adapter.js';
import { requiredString } from '../util/env.js';

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
        rcon: {
            listPlayersCommand: 'ShowPlayers',
            parsePlayerNames: parsePalworldPlayers,
        },
        serverScripts: {
            start: requiredString('GAME_START_SCRIPT'),
            stop: requiredString('GAME_STOP_SCRIPT'),
            backup: requiredString('GAME_BACKUP_SCRIPT'),
            update: requiredString('GAME_UPDATE_SCRIPT'),
        },
    };
}
