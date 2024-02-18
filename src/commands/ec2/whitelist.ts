import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { Ec2AbstractCommand } from "./ec2-abstract-command.js";
import { AuthorizeSecurityGroupIngressCommand, AuthorizeSecurityGroupIngressCommandOutput } from "@aws-sdk/client-ec2";
import { ec2Client } from "../../index.js";

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
            const ip = interaction.options.get('ip').value as string;
            //https://ihateregex.io/expr/ip/
            const ipRegex = new RegExp('(?:\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}');
            if (!ipRegex.test(ip)) {
                this.sendReply(interaction, {content: 'Please enter a valid IP. Ask Kevin for help if needed.', ephemeral: true});    
            } else {
                // await this.whitelistIp(ip);
                this.sendReply(interaction, {content: `Whitelisted ${ip}`, ephemeral: true});
            }

        } catch (error) {
            // new ErrorHandler(error.message, 'GetIpCommand', '/ip');
            console.log(error);
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
        console.log(response);
        return response;
    }

}