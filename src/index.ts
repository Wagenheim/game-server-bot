import { Events, GatewayIntentBits } from 'discord.js';
import { configDotenv } from 'dotenv';
import tsClient from './util/client.js';
import { EC2Client } from '@aws-sdk/client-ec2';
import DiscordInteractionErrorHandler from './err/discord-interaction-error-handler.js';

//@KEVIN What if already whitelisted?
//@KEVIN duplicated logic in startInstance/Stopinstance/reboot

//adds environment vars to process.env
configDotenv();

//List of commands to generate when starting up
const commands = [
    // 'start',
    'ip',
    // 'stop',
    'status',
    // 'whitelist',
    'restart',
    'show-players'
];

//Start up the clients
export const client = new tsClient({intents: [GatewayIntentBits.Guilds]}, commands);
export const ec2Client = new EC2Client({region: process.env.EC2_INSTANCE_REGION});
//Load commands into the client and deploys them to the application
await client.loadCommands();

//Print to the console once the bot has logged in 
client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);
});

//Handler for incoming / commands
client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }
    try {
        const command = client.getCommands().get(interaction.commandName);
        if (!command) {
            const message = `Cannot find ${interaction.commandName} command.`
            interaction.reply(message);
            throw new Error(message)
        }
        command.execute(interaction);
    } catch (error) {
        const discordError = new DiscordInteractionErrorHandler('Restart.execute()', interaction, error);
        discordError.handle();
    }
});

//Login to the application's bot
const token = process.env.DISCORD_TOKEN;
client.login(token);