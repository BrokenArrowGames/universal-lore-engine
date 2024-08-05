import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "@db/entity/user.entity";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { AwsModule } from "@mod/aws/aws.module";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AwsModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
