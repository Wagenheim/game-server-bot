import ErrorHandlerAbstract from "./abstract-error-handler.js";

export default class SshClientErrorHandler extends ErrorHandlerAbstract {
    constructor(
        functionName: string,
        nodeError?: any
    ) {
        super();
        this.adminMessage = `
            An error occurred connecting using the SSH Client.
            Function: ${functionName}.
            Node: ${nodeError ?? 'N/A'}
        `    
    }
}