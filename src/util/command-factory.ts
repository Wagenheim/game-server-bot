import { GetIpCommand } from "../commands/ec2/get-ip.js";
import { RestartCommand } from "../commands/ec2/restart.js";
import { StartCommand } from "../commands/ec2/start.js";
import { StatusCommand } from "../commands/ec2/status.js";
import { StopCommand } from "../commands/ec2/stop.js";
import { WhitelistCommand } from "../commands/ec2/whitelist.js";
import { ShowPlayersCommand } from "../commands/palworld/show-players.js";
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
            case 'stop':
                return new StopCommand(name);
            case 'status':
                return new StatusCommand(name);
            case 'whitelist':
                return new WhitelistCommand(name);
            case 'restart':
                return new RestartCommand(name);
            case 'show-players':
                return new ShowPlayersCommand(name);
            default:
                throw new Error(`Cannot find a command with ${name}`);
        }
    }

}