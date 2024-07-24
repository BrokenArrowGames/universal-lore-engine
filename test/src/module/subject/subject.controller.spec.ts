import { TestBed } from '@automock/jest';
import { SubjectController } from '@mod/subject/subject.controller';
import { SubjectService } from '@mod/subject/subject.service';

describe('SubjectController', () => {
  let controller: SubjectController;
  let _service: SubjectService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(SubjectController).compile();

    controller = unit;
    _service = unitRef.get(SubjectService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
