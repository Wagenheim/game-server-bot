import { TextChannel } from 'discord.js';
import { client } from '../index.js';

export default abstract class ErrorHandlerAbstract {
    public adminMessage = 'Default Admin Message';
    public channelMessage = `An error occured, DM\'d the details to ${process.env.DISCORD_ADMIN_NAME}.`
    public handle(): void {
        const adminDM = client.users.cache.find(user => user.username === process.env.DISCORD_ADMIN_USER_NAME);
        adminDM.send(this.adminMessage);
        const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID) as TextChannel;
        channel.send(this.channelMessage);
    }
}