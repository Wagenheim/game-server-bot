import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { Ec2AbstractCommand } from "./ec2-abstract-command.js";
import { AuthorizeSecurityGroupIngressCommand, AuthorizeSecurityGroupIngressCommandOutput } from "@aws-sdk/client-ec2";
import { ec2Client } from "../../index.js";
import DiscordInteractionErrorHandler from "../../err/discord-interaction-error-handler.js";

export class WhitelistCommand extends Ec2AbstractCommand {

    private description = 'whitelist an ip';
    private paramDescription = 'ip to whitelist';

    constructor(name: string){
        super(name);
        const command = this.getCommand();
        command.setDescription(this.description);
        command.addStringOption(option => option.setName('ip').setDescription(this.paramDescription).setRequired(true));
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            // const ip = interaction.options.get('ip').value as string;
            // const ipRegex = new RegExp('');
            // if (!ipRegex.test(ip)) {
            //     this.sendReply(interaction, {content: 'Please enter a valid IP. Ask Kevin for help if needed.', ephemeral: true});    
            // } else {
            //     // await this.whitelistIp(ip);
            //     this.sendReply(interaction, {content: `Whitelisted ${ip}`, ephemeral: true});
            // }
            this.sendReply(interaction, {content: `Kevin needs to give me AWS permissions to run /${interaction.commandName}`, ephemeral: true});
        } catch (error) {
            const discordError = new DiscordInteractionErrorHandler('Restart.execute()', interaction, error);
            discordError.handle();
        }

    }

    private async whitelistIp(ip: string): Promise<AuthorizeSecurityGroupIngressCommandOutput> {
        const command = new AuthorizeSecurityGroupIngressCommand({
            GroupId: process.env.EC2_SG_ID,
            IpPermissions: [
                {
                    IpProtocol: "udp",
                    FromPort: Number(process.env.EC2_SG_PORT),
                    ToPort: Number(process.env.EC2_SG_PORT),
                    IpRanges: [{ CidrIp: `${ip}/32` }],
                },
            ]
        });
        const response = await ec2Client.send(command);
        return response;
    }

}