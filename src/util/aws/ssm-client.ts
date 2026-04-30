import { SSMClient } from '@aws-sdk/client-ssm';
import { config } from '../config.js';

export const ssmClient = new SSMClient({ region: config.EC2_INSTANCE_REGION });
