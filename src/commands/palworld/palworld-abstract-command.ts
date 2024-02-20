import { AbstractCommand } from "../utility/abstract-command.js";

export abstract class AbstractPalworldCommand extends AbstractCommand {
    constructor(name: string){
        super(name);
    }
}