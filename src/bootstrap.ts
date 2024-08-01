import { NestFactory } from '@nestjs/core';
import { AppModule } from '@mod/app/app.module';
import { AppLogger } from '@mod/logger/logger.service';
import { LoggerInterceptor } from '@mod/logger/logger.interceptor';
import { GlobalErrorFilter } from '@err/global-error.filter';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
import { Config, INFER } from '@util/config';

export async function bootstrap(app) {
  const config = app.get(ConfigService<Config>);

  app.useLogger(new AppLogger(config));
  app.useGlobalInterceptors(new LoggerInterceptor(new AppLogger(config)));
  app.useGlobalFilters(new GlobalErrorFilter(new AppLogger(config)));

  // TODO: need real session store, such as redis
  // https://docs.nestjs.com/techniques/session
  app.use(
    session({
      secret: config.getOrThrow('auth.session.secret', INFER),
      cookie: {
        // TODO: tls in dev/prod envs
        secure: !config.getOrThrow('app.local', INFER),
        maxAge: config.getOrThrow('auth.session.maxage', INFER),
      },
      resave: false,
      saveUninitialized: false,
    }),
  );

  await app.listen(config.getOrThrow('app.port', INFER));
}
