import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function loadScript(game: string, script: string): string {
    const path = join(root, 'build', 'scripts', game, `${script}.sh`);
    return readFileSync(path, 'utf8');
}
