import { Client, ClientOptions, Collection, REST, Routes } from 'discord.js'
import CommandFactory from './command-factory.js';
import { AbstractCommand } from '../commands/utility/abstract-command.js';

/**
 * A wrapper class that extends discord.js' client.
 * 
 * TS doesn't like when I attempted to set the commands property of their client,
 * so I created this wrapper that has the command collection as apart of it.
 * 
 * It also will load the commands and deploy them to the application on creation.
 */
export default class tsClient extends Client {

    private collection: Collection<string, AbstractCommand>;
    private commandFactory: CommandFactory;
    private commandsToGenerate: string[];

    constructor(options: ClientOptions, commandsToGenerate: string[]) {
        super(options);
        this.commandFactory = new CommandFactory();
        this.commandsToGenerate = commandsToGenerate;
        this.collection = new Collection();
    }

    public async loadCommands(): Promise<void> {
        
        //Array for the JSON body for deploying the commands
        const commandDataJSON = [];

        //Loop over the list in ./src/index.js and generate a command,
        //sets it in the collection, and converts to JSON. 
        for (const commandToGenerate of this.commandsToGenerate) {
            const command = this.commandFactory.generateCommand(commandToGenerate);
            this.collection.set(command.getCommand().name, command);
            commandDataJSON.push(command.getCommand().toJSON());
        }

        //Deploy the commands
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);
        try {
            console.log("Deploying Commands...");
            await rest.put(
                Routes.applicationGuildCommands(
                    process.env.DISCORD_APPLICATION_CLIENT_ID,
                    process.env.DISCORD_LOCKING_D_SERVER_ID
                ),
                { body: commandDataJSON }
            );
            console.log(`Deployed ${this.commandsToGenerate.length} commands.`);
        } catch (error) {
            console.log(error);
        }

    }

    public getCommands(): Collection<any, any> {
        return this.collection;
    }

}