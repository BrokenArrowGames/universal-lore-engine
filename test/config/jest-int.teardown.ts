import pino from 'pino';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

export default async (_globalConfig, _projectConfig) => {
  const logger = pino({ level: 'error' });
  await DatabaseCleanup(logger);
  await CognitoCleanup(logger);
  await AppCleanup(logger);
};

async function DatabaseCleanup(logger: pino.Logger) {
  logger.info('database stopping');

  const ds: DataSource = globalThis.datasource;
  for (const _m of ds.migrations) {
    logger.trace('revert migration');
    await ds.undoLastMigration();
  }
  await ds.destroy();

  logger.info('database stopped');
}

async function CognitoCleanup(logger: pino.Logger) {
  logger.info('cognito stopping');

  const server = globalThis.cognitoServer;
  server.close();

  logger.info(`cognito stopped`);
}

async function AppCleanup(logger: pino.Logger) {
  logger.info('app stopping');
  await (globalThis.app as INestApplication).close();
  logger.info('app stopped');
}
