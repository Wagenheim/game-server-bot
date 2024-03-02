import { Events, GatewayIntentBits, TextChannel } from 'discord.js';
import { configDotenv } from 'dotenv';
import tsClient from './util/client.js';
import { EC2Client } from '@aws-sdk/client-ec2';
import DiscordInteractionErrorHandler from './err/discord-interaction-error-handler.js';
import { CronJob } from 'cron';
import palRconClient from './util/rcon-client.js';

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


//adds environment vars to process.env
configDotenv();

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

const cronOne = new CronJob('0,30 * * * *', async function() {
    const cronOneInsideCallback = this;

    const rcon = new palRconClient();
    const instanceStatus = await rcon.getInstanceStatus();
    if (instanceStatus !== 'running') {
        return;
    }

    const rconClient = await rcon.connect();
    const showPlayers = await rconClient.cmd('ShowPlayers');
    await rconClient.close();
    const playerList = showPlayers
                            .replace(/[a-z]*,[a-z]*,[a-z]*\n/, '')
                            .replace(/,\d*,\d*/g, '')
                            .trim()
                            .split('\n');

    if (playerList[0] && playerList.length > 0) {
        return;
    } else {
        const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID) as TextChannel;
        channel.send('No players were found on the server. If there is no one on the server in an hour from now, it will be shut down.');

        cronOneInsideCallback.stop();

        await new Promise(resolve => setTimeout(resolve, 60*60000));

        const instanceStatusTwo = await rcon.getInstanceStatus();
        if (instanceStatusTwo !== 'running') {
            cronOneInsideCallback.start();
            return;
        }

        const rconTwo = new palRconClient();
        const rconClientTwo = await rconTwo.connect();
        const showPlayersTwo = await rconClientTwo.cmd('ShowPlayers');
        await rconClientTwo.close();
        const playerListTwo = showPlayersTwo
                                .replace(/[a-z]*,[a-z]*,[a-z]*\n/, '')
                                .replace(/,\d*,\d*/g, '')
                                .trim()
                                .split('\n');

        if (playerListTwo[0] && playerListTwo.length > 0) {
            cronOneInsideCallback.start();
            return;
        } else {
            await rcon.stopInstance();
            cronOneInsideCallback.start();
            return;
        }
    }
}).start();
console.log('Cron started');

//Login to the application's bot
const token = process.env.DISCORD_TOKEN;
client.login(token);