import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '@mod/logger/logger.module';
import { SubjectEntity } from '@db/entity/subject.entity';
import { SubjectTagEntity } from '@db/entity/subject-tag.entity';
import { UserEntity } from '@db/entity/user.entity';
import { SubjectService } from './subject.service';
import { SubjectTagService } from './subject-tag.service';
import { SubjectController } from './subject.controller';
import { SubjectTagController } from './subject-tag.controller';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([SubjectEntity, SubjectTagEntity, UserEntity]),
  ],
  providers: [SubjectService, SubjectTagService],
  controllers: [SubjectController, SubjectTagController],
})
export class SubjectModule {}
