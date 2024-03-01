import SSH, { SSHConfig }  from 'simple-ssh';
import SshClientErrorHandler from '../err/ssh-client-error-handler.js'

export default class SshClient {

    private ssh: SSH;

    constructor(ip: string, user: string){
        const sshConfig: SSHConfig = {
            host: ip,
            user: user,
            key: process.env.EC2_SSH_PRIVATE_KEY
        }
        this.ssh = new SSH(sshConfig);
    }
    
    public getSSH(): SSH {
        return this.ssh;
    }

    public addCommandToQueue(command: string): void {
        try{
            this.ssh.exec(command);
        } catch (error) {
            throw new SshClientErrorHandler('SshClient.addCommandToQueue()').handle();
        }
    } 

    public runCommands(onSuccess: () => void, onFail: (error: any) => void): void {
        try {
            this.ssh.start({success: onSuccess, fail: onFail});
        } catch (error) {
            throw new SshClientErrorHandler('SshClient.addCommandToQueue()').handle();
        }
    }

    public killConnection(): void {
        this.ssh.end();
    }

}