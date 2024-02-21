import { CronJob } from "cron";
import palRconClient from "./rcon-client.js";

export default class CronFactory {

    constructor(){}

    public static async createPlayerCountJob(cronTime: string, counter: any): Promise<void> {
        const cronJob = new CronJob(cronTime, async () => {
            const rconClient = await new palRconClient().connect();
            const response = await rconClient.cmd('ShowPlayers');
            const cleanList = response
                                .replace(/[a-z]*,[a-z]*,[a-z]*\n/, '')
                                .replace(/,\d*,\d*/g, '')
                                .trim()
                                .split('\n');

            // console.log(cleanList);

            if (cleanList.length <= 0) {
                console.log('empty');
                counter++;
            } else {
                console.log(cleanList.length);
                counter++;
                console.log(counter);
            }
            await rconClient.close();
        });
        return cronJob.start();
    }

}