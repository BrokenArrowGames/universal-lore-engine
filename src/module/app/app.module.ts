import { Module, MiddlewareConsumer } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "@mod/user/user.module";
import { SubjectModule } from "@mod/subject/subject.module";
import { LoggerModule } from "@mod/logger/logger.module";
import { CorrelationMiddleware } from "@mod/logger/correlation.middleware";
import { AuthModule } from "@mod/auth/auth.module";
import { UserEntity } from "@db/entity/user.entity";
import { Config, INFER, LoadConfig } from "@util/config";
import { BootstrapModule } from "@/bootstrap/bootstrap.module";
import { SessionEntity } from "@/database/entity/session.entity";
import { HealthModule } from "../health/health.module";

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [LoadConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Config, true>) => ({
        type: "postgres",
        host: config.getOrThrow("database.host", INFER),
        port: config.getOrThrow("database.port", INFER),
        username: config.getOrThrow("database.username", INFER),
        password: config.getOrThrow("database.password", INFER),
        database: config.getOrThrow("database.name", INFER),
        schema: config.getOrThrow("database.schema", INFER),
        autoLoadEntities: true,
        // synchronize: true,
        // logging: true
      }),
    }),
    TypeOrmModule.forFeature([UserEntity, SessionEntity]),
    BootstrapModule,
    HealthModule,
    AuthModule,
    UserModule,
    SubjectModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes("*");
  }
}
