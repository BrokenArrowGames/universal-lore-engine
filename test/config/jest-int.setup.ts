import './mock-require';
import { bootstrap } from '@/bootstrap';
import { AppModule } from '@/module/app/app.module';
import { NestFactory } from '@nestjs/core';
import pino, { Level } from 'pino';
import * as cognito from 'cognito-local';
import {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
  CreateUserPoolClientCommand,
  CreateUserPoolCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DataSource } from 'typeorm';
import 'dotenv/config';

export default async (_globalConfig, _projectConfig) => {
  const logger = pino({ level: 'error' });
  await RunMigrations(logger, { hostname: 'ule-db-2' });
  await StartCognito(logger, {
    hostname: '127.0.0.1',
    port: 9596,
    PoolName: 'ule-int-test',
  });
  await StartApp(logger, { port: 9595, level: 'fatal' });
};

async function RunMigrations(
  logger: pino.Logger,
  { hostname }: { hostname: string },
) {
  logger.info('database starting');
  if (hostname) process.env.DB_APP_HOST = hostname;

  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_APP_HOST,
    port: +(process.env.DB_APP_PORT ?? 0),
    username: process.env.DB_APP_USERNAME,
    password: process.env.DB_APP_PASSWORD,
    database: process.env.DB_APP_DATABASE,
    entities: ['src/database/entity/**/*.ts'],
    migrations: [
      'src/database/migration/**/*.ts',
      'test/database/seed/**/*.ts',
    ],
    migrationsTableName: 'public.migrations',
  });
  await ds.initialize();
  await ds.runMigrations({ transaction: 'all' });
  globalThis.datasource = ds;

  logger.info('database started');
}

async function StartCognito(
  logger: pino.Logger,
  {
    hostname,
    port,
    PoolName,
  }: { hostname: string; port: number; PoolName: string },
) {
  logger.info('cognito starting');
  const server = await cognito.createDefaultServer(logger as any);
  const s = await server.start({ hostname, port });
  globalThis.cognitoServer = s;

  const endpoint = `http://${hostname}:${port}/`;
  const client = new CognitoIdentityProviderClient({
    endpoint: endpoint,
    region: 'us-east-1',
  });

  const {
    UserPool: { Id: UserPoolId },
  } = await client.send(new CreateUserPoolCommand({ PoolName }));

  const {
    UserPoolClient: { ClientId: UserPoolClientId },
  } = await client.send(
    new CreateUserPoolClientCommand({
      UserPoolId,
      ClientName: `${PoolName}-client`,
    }),
  );

  for (const Username of ['tst_admin', 'tst_user']) {
    await client.send(
      new AdminCreateUserCommand({
        UserPoolId,
        Username,
        DesiredDeliveryMediums: ['EMAIL'],
        UserAttributes: [{ Name: 'email', Value: `${Username}@example.com` }],
      }),
    );
    await client.send(
      new AdminSetUserPasswordCommand({
        UserPoolId,
        Username,
        Password: 'mysecretpassword',
      }),
    );
  }

  process.env.COGNITO_POOL_ID = UserPoolId;
  process.env.COGNITO_CLIENT_ID = UserPoolClientId;
  process.env.COGNITO_ENDPOINT = endpoint;
  logger.info(`cognito started @ ${endpoint}`);
}

async function StartApp(
  logger: pino.Logger,
  { port, level }: { port: number; level: Level },
) {
  logger.info('app starting');

  process.env.APP_PORT = `${port}`;
  process.env.APP_LOG_LEVEL = level;
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  await bootstrap(app);

  await new Promise((resolve) => setTimeout(resolve, 1000));
  globalThis.app = app;

  logger.info('app started');
}
