import { TextChannel } from "discord.js";
import ErrorHandlerAbstract from "./abstract-error-handler.js";

export default class DiscordMessageErrorHandler extends ErrorHandlerAbstract {
    constructor(
        functionName: string,
        channel: TextChannel,
        nodeError?: any
    ) {
        super();
        this.adminMessage = `
            A Discord message send attempt has errored.
            Channel Name: ${channel.name}.
            Function: ${functionName}.
            Node: ${nodeError ?? 'N/A'}
        `    
    }
}