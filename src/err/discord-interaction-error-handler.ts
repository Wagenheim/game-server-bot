import ErrorHandlerAbstract from "./abstract-error-handler.js";
import { CacheType, ChatInputCommandInteraction } from "discord.js";

export default class DiscordInteractionErrorHandler extends ErrorHandlerAbstract {
    constructor(
        functionName: string,
        interaction: ChatInputCommandInteraction<CacheType>,
        nodeError?: any
    ) {
        super();
        this.adminMessage = `
            A Discord interaction error occurred.
            Command: ${interaction.commandName}.
            Function: ${functionName}.
            User: ${interaction.user.username}.
            Node: ${nodeError ?? 'N/A'}
        `    
    }
}