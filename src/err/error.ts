import { TextChannel } from 'discord.js';
import { client } from '../index.js'

export default class ErrorHandler {
    constructor(
        message: string, 
        className: string, 
        command: string
    ) {
        this.handle(message, className, command);
    }
    private handle(
        message: string, 
        className: string, 
        command: string
    ) {
        const channel = client.users.cache.find(user => user.username === process.env.DISCORD_ADMIN_USER_NAME);
        channel.send(`
            An error occured with the Palworld Bot
            Command: ${command}
            Class Name: ${className}
            Message: ${message}
        `);
    }
}