import { ConfigGetOptions } from '@nestjs/config';

export type Config = {
  app: {
    local: boolean;
    env: 'local' | 'dev' | 'prod';
    port: number;
  };
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    schema: string;
  };
  aws: {
    region: string;
    cognito: {
      endpoint?: string;
      pool: string;
      client: string;
    };
  };
  auth: {
    session: {
      secret: string;
      maxage: number;
    };
  };
};

export const LoadConfig = (): Config => ({
  app: {
    local: process.env.APP_ENV === 'local',
    env: process.env.APP_ENV as 'local' | 'dev' | 'prod',
    port: +(process.env.APP_PORT ?? 3000),
  },
  database: {
    host: process.env.DB_APP_HOST,
    port: +process.env.DB_APP_PORT,
    username: process.env.DB_APP_USERNAME,
    password: process.env.DB_APP_PASSWORD,
    name: process.env.DB_APP_DATABASE,
    schema: process.env.DB_APP_SCHEMA,
  },
  aws: {
    region: 'us-east-1',
    cognito: {
      pool: process.env.COGNITO_POOL_ID,
      client: process.env.COGNITO_CLIENT_ID,
    },
  },
  auth: {
    session: {
      secret: process.env.AUTH_SESSION_SECRET,
      maxage: +(process.env.AUTH_SESSION_MAXAGE ?? 6 * 60 * 60 * 1000), // default to 6 hours
    },
  },
});

export const INFER: ConfigGetOptions = { infer: true };
