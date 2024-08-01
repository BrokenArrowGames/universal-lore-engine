import { NestFactory } from '@nestjs/core';
import { bootstrap } from './bootstrap';
import { AppModule } from '@mod/app/app.module';

(async () => {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  bootstrap(app);
})();
