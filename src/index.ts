import { Events, GatewayIntentBits } from 'discord.js';
import { configDotenv } from 'dotenv';
import tsClient from './util/client.js';
import { EC2Client } from '@aws-sdk/client-ec2';
import DiscordInteractionErrorHandler from './err/discord-interaction-error-handler.js';
import CronFactory from './util/cron-factory.js';
import { CronJob } from 'cron';

//@KEVIN duplicated logic in startInstance/Stopinstance/reboot
//@KEVIN implement an "are you sure?"

// cron-CronFactory
// termination errorhandling
// do i need to kill the ssh connections?

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

//Start the playerCheck cronjob
// const cronFactory = new CronFactory();

const cronOne = new CronJob('0-59 * * * *', function() {
    console.log('cronOne Tick');
    const cronOneInsideCallback = this;
    let playerCount = 0;

    if (playerCount === 0){
        const cronTwo = new CronJob('0-59 * * * *', () => {
            console.log('cronTwo Tick');
            const playerCountTwo = 0;
            if (playerCountTwo === 0) {
                //shutdown instance
                console.log('cronTwo started cronOne');
                cronOneInsideCallback.start();
            }
        });
        cronTwo.runOnce = true;
        cronTwo.start();
        console.log('cronTwo started');
        cronOneInsideCallback.stop();
        console.log('cronOne stopped');
    } 
}).start();
console.log('cronOne started');

//Login to the application's bot
const token = process.env.DISCORD_TOKEN;
client.login(token);