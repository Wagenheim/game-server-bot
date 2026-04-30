import { configDotenv } from 'dotenv';

configDotenv();

export function requiredString(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export function requiredNumber(name: string): number {
    const raw = requiredString(name);
    const value = Number(raw);
    if (!Number.isFinite(value)) {
        throw new Error(`Environment variable ${name} must be a number, got: ${raw}`);
    }
    return value;
}
