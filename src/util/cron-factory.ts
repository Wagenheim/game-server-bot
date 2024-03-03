import { CronJob } from "cron";
import palRconClient from "./rcon-client.js";
import { DescribeInstancesCommand, InstanceStateName, StopInstancesCommand } from "@aws-sdk/client-ec2";
import { ec2Client } from "../index.js";
import AwsErrorHandler from "../err/aws-error-handler.js";
import { TextChannel } from 'discord.js';
import { client } from '../index.js';
import RconClientErrorHandler from "../err/rcon-client-error-handler.js";
import AwsInstanceTerminatedErrorHandler from "../err/aws-instance-terminated-error-handler.js";

export default class CronFactory {


    /**
     * When the instance is invoked
     *      1. player check cronjob created, set to run at 0/30 every hour
     *      2. player check callback checks the instance state
     *          if the instance is anything but running, skip and move on to next 0/30
     *          if the instance is running, grab the player count from the server          
     *              if the player count is > 0, skip and move on to the next 0/30
     *              if player count = 0
     *                  create and start the shutdown cronjob
     *                  stop the playercheck job
     *      3. shut down call back checks the instance state
     *          if its anything but running
     *          if its running, do another player check
     *              if player count = 0, shutdown the server
     *              if player count > 0, 
     *          make sure the player check job is running and stop the shutdown job
     */

    private awsCommand = new DescribeInstancesCommand({
        Filters: [
            {
                Name: 'instance-id', 
                Values: [process.env.EC2_INSTANCE_ID]
            }
        ]
    });

    private awsStopCommand = new StopInstancesCommand({
        InstanceIds: [process.env.EC2_INSTANCE_ID]
    });

    private playerCheckJob: CronJob;
    private playerCheckCronTime = '0,30 * * * *';

    private shutDownJob: CronJob;
    private shutDownTime: string;

    constructor(){
        this.playerCheckJob = new CronJob(this.playerCheckCronTime, this.getPlayerListCallback);
        this.playerCheckJob.start();
    }

    private getMinutes(): string {
        return new Date().getUTCMinutes().toString();
    }

    private getNextHour(): string {
        const hour = new Date().getUTCHours();
        if (hour === 23) {
            return '0'
        }
        return (hour + 1).toString();
    }

    private async getInstanceState(): Promise<InstanceStateName> {
        try {
            const response = await ec2Client.send(this.awsCommand);
            const statusCode = response.$metadata.httpStatusCode; 
            if (statusCode === 200) {
                return response.Reservations[0].Instances[0].State.Name;
            } else {
                throw new AwsErrorHandler(response, 'CronFactory.describeInstance()');
            }
        } catch (error) {
            if (error instanceof AwsErrorHandler) {
                error.handle();
            } else {
                console.log(error);
            }
        }
    } 

    private async shutDownInstance(): Promise<void> {
        try {
            const response = await ec2Client.send(this.awsStopCommand);
            const statusCode = response.$metadata.httpStatusCode;
            if (statusCode !== 200) {
                throw new AwsErrorHandler(response, 'CronFactory.shutDownInstance()');
            }
        } catch (error) {
            if (error instanceof AwsErrorHandler) {
                error.handle();
            } else {
                console.log(error);
            }
        }
    }

    private async getPlayerCount(): Promise<number> {

        try {
            const rconClient = await new palRconClient().connect();
            const response = await rconClient.cmd('ShowPlayers');
            await rconClient.close();

            //@KEVIN does this work when people are actually not on it?
            //this regex is broken when no one is on.
            const playerList = response
                                    .replace(/[a-z]*,[a-z]*,[a-z]*\n/, '')
                                    .replace(/,\d*,\d*/g, '')
                                    .trim()
                                    .split('\n');


            console.log(playerList);
            console.log('player count: ' + playerList.length);

            return playerList.length;
        } catch (error) {
            throw new RconClientErrorHandler('CronFactory.getPlayerCount()', error).handle();
        }
                        
    }

    private async getPlayerListCallback(): Promise<void> {
        const instanceState = await this.getInstanceState();
        if (instanceState === 'running') {
            const playerCount = await this.getPlayerCount();
            // if (playerCount <= 0) {
                this.shutDownTime = `${this.getMinutes()} ${this.getNextHour()} * * *`;
                this.shutDownJob = new CronJob(this.shutDownTime, this.shutDownCallback);
                this.shutDownJob.start();
                // const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID) as TextChannel;
                // channel.send('Shutdown check in progress...');
                console.log('started shutdown job');
                this.playerCheckJob.stop();
            // }
        }
        if (instanceState === 'terminated') {
            throw new AwsInstanceTerminatedErrorHandler('CronFactory.shutDownCallback()').handle();
        }
    }

    private async shutDownCallback(): Promise<void> {
        const instanceState = await this.getInstanceState();
        switch(instanceState) {
            case 'stopped':
            case 'pending':
            case 'shutting-down':
            case 'stopping':
                this.resetJobs();
                break;
            case 'running':
                console.log('shutdownCallback');
                const playerCount = await this.getPlayerCount();
                // if (playerCount <= 0) {
                    // await this.shutDownInstance();
                // }
                console.log('shut down server');
                this.resetJobs();
                break;
            case 'terminated':
                throw new AwsInstanceTerminatedErrorHandler('CronFactory.shutDownCallback()').handle();
        }
    }

    private resetJobs(): void {
        if (!this.playerCheckJob.running) {
            this.playerCheckJob.start();
        }
        this.shutDownJob.stop();
    }
    
}





    // public async createPlayerCountJob(counter: any): Promise<void> {
    //     const cronJob = new CronJob(this.cronTime, async () => {
    //         const rconClient = await new palRconClient().connect();
    //         const response = await rconClient.cmd('ShowPlayers');
    //         const cleanList = response
    //                             .replace(/[a-z]*,[a-z]*,[a-z]*\n/, '')
    //                             .replace(/,\d*,\d*/g, '')
    //                             .trim()
    //                             .split('\n');


    //         //Doubt this will return 0 if server down
    //         if (cleanList.length <= 0) {
                

    //             const scheduledJob = new CronJob(`${this.getMinutes()} ${this.getNextHour()} * * *`, () => {
                    
    //             });

    //             //Actually, i am unsure if cron will update the time :/
    //             this.cronTime = this.getMinutes() + ' ' + this.getNextHour + ' * * *';
    //             this.shutDown = true;
                
    //             console.log('empty');
    //             counter++;
    //         } else {
    //             console.log(cleanList.length);
    //             counter++;
    //             console.log(counter);
    //         }
    //         await rconClient.close();
    //     });
    //     return cronJob.start();
    // }