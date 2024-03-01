import ErrorHandlerAbstract from "./abstract-error-handler.js";

export default class AwsInstanceTerminatedErrorHandler extends ErrorHandlerAbstract {
    constructor(
        functionName: string,
    ) {
        super();
        this.adminMessage = `
            The instance state was found to be terminated.
            Function found: ${functionName}
        `;
        this.channelMessage = 'The server was described as terminated. I DM\'d Kevin but someone should probably text him too.';    
    }
}