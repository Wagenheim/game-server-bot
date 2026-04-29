/**
 * A GameAdapter encapsulates everything that varies between game servers.
 *
 * The bot itself is game-agnostic. At startup, loadAdapter() reads the GAME
 * env var and returns the matching adapter. Generic command code reads from
 * the adapter instead of hardcoding game-specific values.
 *
 * To add a new game: implement this interface in a new file under src/games/
 * and register it in load-adapter.ts.
 */
export interface GameAdapter {
    readonly name: string;
    readonly gamePort: number;
    readonly rcon: {
        readonly listPlayersCommand: string;
        parsePlayerNames(response: string): string[];
    };
    readonly serverScripts: {
        readonly start: string;
        readonly stop: string;
        readonly backup: string;
        readonly update: string;
    };
}
