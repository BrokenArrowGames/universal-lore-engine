import { GlobalErrorFilter } from '@err/global-error.filter';
import { AppModule } from '@mod/app/app.module';
import { AuthGuard } from '@mod/auth/auth.guard';
import { CognitoClientProviderToken } from '@mod/aws/cognito.provider';
import { AppLogger } from '@mod/logger/logger.service';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as session from 'express-session';

export async function InitTestNestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(CognitoClientProviderToken)
    .useValue({
      send: () => ({ AuthenticationResult: { AccessToken: 'dummy-token' } }),
    })
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.session.token = 'dummy-token';
        req.session = { username: 'dummy-user' };
        req.user = { id: 1, name: 'dummy-user' };
        return true;
      },
    })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalFilters(new GlobalErrorFilter(new AppLogger()));
  app.use(
    session({
      secret: 'dummy-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );
  return app;
}
