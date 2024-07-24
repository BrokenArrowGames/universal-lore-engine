import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from '@db/entity/user.entity';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { AwsModule } from '@mod/aws/aws.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AwsModule, AuthModule],
  providers: [UserService, AuthService],
  controllers: [UserController],
})
export class UserModule {}
