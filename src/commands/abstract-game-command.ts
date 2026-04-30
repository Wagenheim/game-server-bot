import { AbstractCommand } from "./utility/abstract-command.js";

export abstract class AbstractGameCommand extends AbstractCommand {
    constructor(name: string) {
        super(name);
    }
}
