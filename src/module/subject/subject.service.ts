import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, QueryFailedError, EntityNotFoundError } from 'typeorm';
import { FilterQuery } from '@util/filter-query';
import {
  CreateSubjectRequest,
  SubjectDto,
  SubjectDtoFromEntity,
  UpdateSubjectRequest,
} from './subject.dto';
import { SubjectEntity } from '@db/entity/subject.entity';
import { AuthUser } from '../auth/auth.dto';

export type SubjectFilter = FilterQuery<SubjectDto, 'display_name' | 'type'> & {
  tags: string;
};

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(SubjectEntity)
    private readonly subjectRepo: Repository<SubjectEntity>,
  ) {}

  public async getFilteredSubjects(
    filterQuery: SubjectFilter,
  ): Promise<SubjectDto[]> {
    const tags = filterQuery.tags?.split(',');
    let tmpQuery = this.subjectRepo
      .createQueryBuilder('subject')
      .select('subject.id')
      .leftJoin('subject_tag_mapping', 'map', 'subject.id = map.subject_id')
      .leftJoin('subject.tags', 'subjecttag', 'subjecttag.id = map.tag_id');
    if (tags?.length) {
      tmpQuery = tmpQuery
        .where('subject.id = map.subject_id')
        .andWhere('subjecttag.id = map.tag_id')
        .andWhere('subjecttag.name IN (:...tags)', { tags })
        .groupBy('subject.id')
        .having('COUNT(subject.id) = :tagCount', { tagCount: tags.length });
    }

    const tmpEntities = (await tmpQuery.getMany()) as SubjectEntity[];
    const entities = await this.subjectRepo.find({
      select: {
        id: true,
        display_name: true,
        type: true,
        tags: true,
        short_description: true,
      },
      where: { id: In(tmpEntities.map(({ id }) => id)) },
      relations: ['tags'],
    });
    return entities.map(SubjectDtoFromEntity);
  }

  public async getSubjectById(id: number): Promise<SubjectDto> {
    try {
      const entity = await this.subjectRepo.findOneOrFail({
        where: { id },
        relations: ['tags', 'created_by', 'modified_by'],
      });
      return SubjectDtoFromEntity(entity);
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new NotFoundException('record not found', { cause: err });
      } else {
        throw err;
      }
    }
  }

  public async createSubject(
    currentUser: AuthUser,
    reqData: CreateSubjectRequest,
  ): Promise<SubjectDto> {
    const newSubject = this.subjectRepo.create({
      ...reqData,
      created_by: { id: currentUser.id },
      modified_by: { id: currentUser.id },
    });

    try {
      const result = await this.subjectRepo.save(newSubject);
      return SubjectDtoFromEntity(result);
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        err.message.includes('violates unique constraint')
      ) {
        throw new ConflictException('record conflict', { cause: err });
      } else {
        throw err;
      }
    }
  }

  public async updateSubject(
    currentUser: AuthUser,
    subjectId: number,
    subjectData: UpdateSubjectRequest,
  ): Promise<SubjectDto> {
    try {
      await this.subjectRepo.findOneByOrFail({ id: subjectId });
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new NotFoundException('record not found', { cause: err });
      } else {
        throw err;
      }
    }

    const newSubject = this.subjectRepo.create({
      ...subjectData,
      created_by: { id: currentUser.id },
      modified_by: { id: currentUser.id },
    });

    await this.subjectRepo.update(subjectId, newSubject);

    const result = await this.subjectRepo.findOneByOrFail({ id: subjectId });
    return SubjectDtoFromEntity(result);
  }

  public async deleteSubject(subjectId: number): Promise<void> {
    try {
      const subjectEntity = await this.subjectRepo.findOneByOrFail({
        id: subjectId,
      });
      await this.subjectRepo.remove([subjectEntity]);
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new NotFoundException('record not found', { cause: err });
      } else {
        throw err;
      }
    }
  }
}
