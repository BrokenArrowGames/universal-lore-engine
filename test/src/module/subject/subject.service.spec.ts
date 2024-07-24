import { TestBed } from '@automock/jest';
import { SubjectEntity } from '@db/entity/subject.entity';
import { SubjectService } from '@mod/subject/subject.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('SubjectService', () => {
  let service: SubjectService;
  let _subjectRepo: Repository<SubjectEntity>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(SubjectService).compile();

    service = unit;
    _subjectRepo = unitRef.get(getRepositoryToken(SubjectEntity) as string);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
