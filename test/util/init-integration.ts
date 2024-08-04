import { bootstrap } from "@/bootstrap";
import { AppModule } from "@/module/app/app.module";
import { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Level } from "pino";
import 'dotenv/config';

export async function InitIntegrationTest(port: number = 9595, logLevel: Level = "fatal"): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  await bootstrap(app);

  return app;
}
