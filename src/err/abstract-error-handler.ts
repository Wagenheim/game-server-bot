import { TextChannel } from 'discord.js';
import { client } from '../index.js';
import { config } from '../util/config.js';

export default abstract class ErrorHandlerAbstract {
    public adminMessage = 'Default Admin Message';
    public channelMessage = `An error occured, DM\'d the details to ${config.DISCORD_ADMIN_NAME}.`
    public handle(): void {
        const adminDM = client.users.cache.find(user => user.username === config.DISCORD_ADMIN_USER_NAME);
        adminDM?.send(this.adminMessage);
        const channel = client.channels.cache.get(config.DISCORD_CHANNEL_ID) as TextChannel;
        channel.send(this.channelMessage);
    }
}