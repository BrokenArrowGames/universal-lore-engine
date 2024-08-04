import { ConfigGetOptions } from '@nestjs/config';
import { Level } from 'pino';

export enum AppEnv {
  LOCAL = 'LOCAL',
  DEV = 'DEV',
  PROD = 'PROD',
}

export type Config = {
  user: {
    root: {
      name: string;
      password: string;
      email: string;
    };
    test: {
      name: string;
      password: string;
      email: string;
    };
  };
  app: {
    local: boolean;
    env: AppEnv;
    port: number;
    log: Level;
    sysUser: string;
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
  constants: {
    redacted: string;
  };
};

export const LoadConfig = (): Config => ({
  app: {
    local: process.env.APP_ENV === AppEnv.LOCAL,
    env: process.env.APP_ENV as AppEnv,
    port: +(process.env.APP_PORT ?? 3000),
    log: (process.env.APP_LOG_LEVEL as Level) ?? 'info',
    sysUser: 'system',
  },
  user: {
    root: {
      name: process.env.ROOT_USER_NAME ?? 'sys_admin',
      password: process.env.ROOT_USER_PASS,
      email: process.env.ROOT_USER_MAIL,
    },
    test: {
      name: process.env.TEST_USER_NAME ?? 'sys_tst_user',
      password: process.env.TEST_USER_PASS,
      email: process.env.TEST_USER_MAIL,
    },
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
      endpoint: process.env.COGNITO_ENDPOINT,
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
  constants: {
    redacted: '[REDACTED]',
  },
});

export const INFER: ConfigGetOptions = { infer: true };
