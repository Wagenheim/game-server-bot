import { Events, GatewayIntentBits } from 'discord.js';
import { configDotenv } from 'dotenv';
import tsClient from './util/client.js';

//adds environment vars to process.env
configDotenv();

//List of commands to generate when starting up
const commands = [
    'server'
];

//Start up the client
const client = new tsClient({intents: [GatewayIntentBits.Guilds]}, commands);

//Load commands into the client and deploys them to the application
await client.loadCommands();

//Print to the console once the bot has logged in 
client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);
});

//Handler for incoming / commands
client.on(Events.InteractionCreate, (interation) => {
    if (!interation.isChatInputCommand()) {
        return;
    }
    try {
        const command = client.getCommands().get(interation.commandName);
        if (!command) {
            const message = `Cannot find ${interation.commandName} command.`
            interation.reply(message);
            throw new Error(message)
        }
        command.execute(interation);
    } catch (error) {
        console.log(error);
    }
});

//Login to the application's bot
const token = process.env.DISCORD_TOKEN;
client.login(token);