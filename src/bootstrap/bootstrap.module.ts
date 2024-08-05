import { Module } from "@nestjs/common";
import { BootstrapService } from "./bootstrap.service";
import { UserModule } from "@/module/user/user.module";
import { UserService } from "@/module/user/user.service";
import { UserEntity } from "@/database/entity/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "@/module/auth/auth.module";
import { AwsModule } from "@/module/aws/aws.module";
import { AuthService } from "@/module/auth/auth.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    AwsModule,
    AuthModule,
    UserModule,
  ],
  providers: [BootstrapService, AuthService, UserService],
})
export class BootstrapModule {}
