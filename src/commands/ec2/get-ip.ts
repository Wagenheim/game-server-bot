import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { Ec2AbstractCommand } from "./ec2-abstract-command.js";

export class GetIpCommand extends Ec2AbstractCommand {

    private description = 'grab the IP of the server';

    constructor(name: string){
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            const status = await this.getStatus();
            if (status === 'stopped') {
                this.sendReply(interaction, 'The server is currently offline. Try running with /start.');     
            }
            const publicIp = await this.getIp();
            this.sendReply(interaction, `${publicIp}:8211`);
        } catch (error) {
            // new ErrorHandler(error.message, 'GetIpCommand', '/ip');
            console.log(error);
        }

    }

}