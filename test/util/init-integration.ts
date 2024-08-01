import { bootstrap } from "@/bootstrap";
import { AppModule } from "@/module/app/app.module";
import { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import 'dotenv/config';
import { Level } from "pino";

export async function InitIntegrationTest(port: number = 9595, logLevel: Level = "fatal"): Promise<INestApplication> {
  process.env.APP_PORT = "" + port;
  process.env.APP_LOG_LEVEL = logLevel;

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  await bootstrap(app);

  return app;
}
