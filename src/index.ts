import { Events, GatewayIntentBits } from 'discord.js';
import tsClient from './util/client.js';
import DiscordInteractionErrorHandler from './err/discord-interaction-error-handler.js';
import { config } from './util/config.js';
import { loadAdapter } from './games/load-adapter.js';
import { startAutoShutdown } from './util/auto-shutdown.js';

const commands = [
    'start',
    'ip',
    'stop',
    'status',
    // 'whitelist',
    'restart',
    'show-players',
    'update',
    'backup'
];

//Start up the clients
export const adapter = loadAdapter();
export const client = new tsClient({intents: [GatewayIntentBits.Guilds]}, commands);
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
        const discordError = new DiscordInteractionErrorHandler('index.execute()', interaction, error);
        discordError.handle();
    }
});

startAutoShutdown();

client.login(config.DISCORD_TOKEN);
