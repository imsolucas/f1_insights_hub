import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  CORS_ORIGIN: string;
  CORS_ORIGINS: string[];
  ERGAST_API_BASE_URL: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
}

const corsOriginRaw = process.env.CORS_ORIGIN || 'http://localhost:3000';
const corsOrigins = corsOriginRaw
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const config: EnvConfig = {
  NODE_ENV: (getEnvVar('NODE_ENV', 'development') as EnvConfig['NODE_ENV']) || 'development',
  PORT: getEnvNumber('PORT', 3001),
  DATABASE_URL: getEnvVar('DATABASE_URL', 'postgresql://localhost:5432/f1_insight_hub'),
  CORS_ORIGIN: corsOriginRaw,
  CORS_ORIGINS: corsOrigins.length > 0 ? corsOrigins : ['http://localhost:3000'],
  ERGAST_API_BASE_URL: getEnvVar('ERGAST_API_BASE_URL', 'https://ergast.com/api/f1'),
};
