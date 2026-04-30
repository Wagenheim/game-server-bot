import { GameAdapter } from './game-adapter.js';
import { createPalworldAdapter } from './palworld-adapter.js';
import { createMinecraftAdapter } from './minecraft-adapter.js';
import { requiredString } from '../util/env.js';

export function loadAdapter(): GameAdapter {
    const game = requiredString('GAME').toLowerCase();
    switch (game) {
        case 'palworld':
            return createPalworldAdapter();
        case 'minecraft':
            return createMinecraftAdapter();
        default:
            throw new Error(`Unknown GAME: ${game}`);
    }
}
