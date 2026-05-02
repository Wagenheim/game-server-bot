import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CacheType,
    ChatInputCommandInteraction,
    ComponentType,
    MessageFlags,
    TextChannel,
} from "discord.js";
import { AbstractCommand } from "../utility/abstract-command.js";
import { client } from "../../index.js";
import DiscordInteractionErrorHandler from "../../err/discord-interaction-error-handler.js";
import DiscordMessageErrorHandler from "../../err/discord-message-error-handler.js";
import { config } from "../../util/config.js";
import { ec2Instance } from "../../util/aws/ec2-instance.js";

const CONFIRM_ID = 'stop-confirm';
const CANCEL_ID = 'stop-cancel';
const CONFIRM_WINDOW_MS = 30_000;

export class StopCommand extends AbstractCommand {

    private description = 'stop the server';

    constructor(name: string){
        super(name);
        this.getCommand().setDescription(this.description);
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try {
            const instanceState = await ec2Instance.getStatus();
            switch(instanceState) {
                case 'stopped':
                    this.sendReply(interaction, 'Instance is already stopped.');
                    break;
                case 'running':
                    await this.confirmAndStop(interaction);
                    break;
                case 'pending':
                case 'shutting-down':
                case 'stopping':
                    this.sendReply(interaction, `Server is currently ${instanceState}. Try running /status in a few minutes.`);
                    break;
                case 'terminated':
                    //@KEVIN terminated?
                    this.sendReply(interaction, 'Instance is terminated. Someone should hit up Kevin ASAP.');
                    break;
                default:
                    this.sendReply(interaction, 'Instance state not recognized. Someone should hit up Kevin.');
                    break;
            }
        } catch (error){
            const discordError = new DiscordInteractionErrorHandler('StopCommand.execute()', interaction, error);
            discordError.handle();
        }
    }

    private async confirmAndStop(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(CONFIRM_ID).setLabel('Stop server').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(CANCEL_ID).setLabel('Cancel').setStyle(ButtonStyle.Secondary),
        );

        const prompt = await interaction.reply({
            content: 'Are you sure you want to stop the server? Anyone still playing will be disconnected.',
            components: [row],
            flags: MessageFlags.Ephemeral,
        });

        try {
            const press = await prompt.awaitMessageComponent({
                filter: i => i.user.id === interaction.user.id,
                componentType: ComponentType.Button,
                time: CONFIRM_WINDOW_MS,
            });

            if (press.customId !== CONFIRM_ID) {
                await press.update({ content: 'Cancelled.', components: [] });
                return;
            }

            await press.update({ content: 'Confirmed.', components: [] });
            await interaction.followUp({ content: `Shutting server down (requested by ${interaction.user}).` });
            await this.stopInstance();
        } catch {
            await interaction.editReply({ content: 'Confirmation timed out — server was not stopped.', components: [] });
        }
    }

    private async stopInstance(): Promise<void> {
        await ec2Instance.stop();
        return new Promise<void>(() => {
            setTimeout(() => {
                const channel = client.channels.cache.get(config.DISCORD_CHANNEL_ID) as TextChannel;
                ec2Instance.getStatus().then(status => {
                    try {
                        if (status === 'stopped') {
                            channel.send('Server has been stopped.');
                        } else {
                            channel.send('Sever hasnt entered stopped state in 1 minutes. Run /status to see what its doing.');
                        }
                    } catch (error) {
                        const discordError = new DiscordMessageErrorHandler('GetIpCommand.execute()', channel, error);
                        discordError.handle();
                    }
                });
            }, 60000);
        });
    }

}