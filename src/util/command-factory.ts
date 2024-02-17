import { AbstractCommand } from "../commands/utility/abstract-command.js";
import { ServerCommand } from "../commands/utility/server.js";

/**
 * Factory class for creating command classes.
 * 
 * Todo: Would like to find a better way to dynamically create these
 */
export default class CommandFactory {

    constructor(){}

    public generateCommand(name: string): AbstractCommand {
        switch (name) {
            case 'server':
                return new ServerCommand(name);
            default:
                throw new Error(`Cannot find a command with ${name}`);
        }
    }

}