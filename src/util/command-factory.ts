import { GetIpCommand } from "../commands/ec2/get-ip.js";
import { StartCommand } from "../commands/ec2/start.js";
import { AbstractCommand } from "../commands/utility/abstract-command.js";
import { ServerCommand } from "../commands/utility/server.js";

/**
 * Factory class for creating command classes.
 */
export default class CommandFactory {

    constructor(){}

    public generateCommand(name: string): AbstractCommand {
        switch (name) {
            case 'server':
                return new ServerCommand(name);
            case 'start':
                return new StartCommand(name);
            case 'ip':
                return new GetIpCommand(name);
            default:
                throw new Error(`Cannot find a command with ${name}`);
                // new ErrorHandler(error.message, 'CommandFactory', 'General');
        }
    }

}