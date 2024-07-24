import { TestBed } from '@automock/jest';
import { SubjectTagEntity } from '@db/entity/subject-tag.entity';
import { SubjectTagService } from '@mod/subject/subject-tag.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('SubjectTagService', () => {
  let service: SubjectTagService;
  let _subjectRepo: Repository<SubjectTagEntity>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(SubjectTagService).compile();

    service = unit;
    _subjectRepo = unitRef.get(getRepositoryToken(SubjectTagEntity) as string);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
