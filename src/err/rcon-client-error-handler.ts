import ErrorHandlerAbstract from "./abstract-error-handler.js";

export default class RconClientErrorHandler extends ErrorHandlerAbstract {
    constructor(
        functionName: string,
        nodeError?: any
    ) {
        super();
        this.adminMessage = `
            An error occurred connecting to the RCON client.
            Function: ${functionName}.
            Node: ${nodeError ?? 'N/A'}
        `    
    }
}