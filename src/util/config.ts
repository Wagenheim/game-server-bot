import { requiredString, requiredNumber } from './env.js';

export const config = {
    DISCORD_TOKEN: requiredString('DISCORD_TOKEN'),
    DISCORD_APPLICATION_CLIENT_ID: requiredString('DISCORD_APPLICATION_CLIENT_ID'),
    DISCORD_CHANNEL_ID: requiredString('DISCORD_CHANNEL_ID'),
    DISCORD_ADMIN_NAME: requiredString('DISCORD_ADMIN_NAME'),
    DISCORD_ADMIN_USER_NAME: requiredString('DISCORD_ADMIN_USER_NAME'),
    DISCORD_LOCKING_D_SERVER_ID: requiredString('DISCORD_LOCKING_D_SERVER_ID'),

    EC2_INSTANCE_ID: requiredString('EC2_INSTANCE_ID'),
    EC2_INSTANCE_REGION: requiredString('EC2_INSTANCE_REGION'),
    EC2_MAIN_USER: requiredString('EC2_MAIN_USER'),
    EC2_SG_ID: requiredString('EC2_SG_ID'),
    EC2_SSH_PRIVATE_KEY: requiredString('EC2_SSH_PRIVATE_KEY'),

    RCON_PASSWORD: requiredString('RCON_PASSWORD'),
    RCON_PORT: requiredNumber('RCON_PORT'),
} as const;
