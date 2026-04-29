import { EC2Client } from '@aws-sdk/client-ec2';
import { config } from '../config.js';

export const ec2Client = new EC2Client({ region: config.EC2_INSTANCE_REGION });
