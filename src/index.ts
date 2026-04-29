import { Events, GatewayIntentBits, TextChannel } from 'discord.js';
import tsClient from './util/client.js';
import DiscordInteractionErrorHandler from './err/discord-interaction-error-handler.js';
import { CronJob } from 'cron';
import { executeRconCommand } from './util/rcon.js';
import { config } from './util/config.js';
import { loadAdapter } from './games/load-adapter.js';
import { ec2Instance } from './util/aws/ec2-instance.js';

//@KEVIN duplicated logic in startInstance/Stopinstance/reboot
//@KEVIN implement an "are you sure?"

// termination errorhandling
// do i need to kill the ssh connections?
// clean up cron/rcon client
// clean up backup/update commands 


//AWS NOTES
    //VPC
        //Makes one for each sub-region
            //ec2-cont & palworld use 1b
        //can make other subnets private by making a new Acl & reassigning
            //new acl wont allow traffic in/oug from 0.0.0.0/0


//List of commands to generate when starting up
const commands = [
    'start',
    'ip',
    'stop',
    'status',
    'whitelist',
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

const cronOne = new CronJob('0,30 * * * *', async function() {
    const cronOneInsideCallback = this;

    const instanceStatus = await ec2Instance.getStatus();
    if (instanceStatus !== 'running') {
        return;
    }

    let showPlayers = '';
    try {
        showPlayers = await executeRconCommand(adapter.rcon.listPlayersCommand);
    } catch {
        //If theres a problem with rcon, ignore and move on.
        //Probably my JP name.
        return;
    }

    if (!showPlayers) {
        //if response didnt change, return. Probably due to my JP name.
        return;
    }

    const playerList = adapter.rcon.parsePlayerNames(showPlayers);

    if (playerList.length > 0) {
        return;
    } else {
        const channel = client.channels.cache.get(config.DISCORD_CHANNEL_ID) as TextChannel;
        channel.send('No players were found on the server. If there is no one on the server in an hour from now, it will be shut down.');

        // cronOneInsideCallback.stop();

        await new Promise(resolve => setTimeout(resolve, 60*60000));

        const instanceStatusTwo = await ec2Instance.getStatus();
        if (instanceStatusTwo !== 'running') {
            // cronOneInsideCallback.start();
            return;
        }

        let showPlayersTwo = '';
        try {
            showPlayersTwo = await executeRconCommand(adapter.rcon.listPlayersCommand);
        } catch {
            //If theres a problem with rcon, ignore and move on.
            //Probably my JP name.
            return;
        }

        if (!showPlayers) {
            //if response didnt change, return. Probably due to my JP name.
            return;
        }

        const playerListTwo = adapter.rcon.parsePlayerNames(showPlayersTwo);

        if (playerListTwo.length > 0) {
            // cronOneInsideCallback.start();
            return;
        } else {
            await ec2Instance.stop();
            channel.send('Server has been shut down.');
            // cronOneInsideCallback.start();
            return;
        }
    }
}).start();
console.log('Cron started');

//Login to the application's bot
client.login(config.DISCORD_TOKEN);