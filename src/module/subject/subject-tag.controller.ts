import { Controller, Get, Query } from '@nestjs/common';
import { SubjectTagFilter, SubjectTagService } from './subject-tag.service';
import { SubjectTagDto } from './subject-tag.dto';

@Controller('subject-tag')
export class SubjectTagController {
  constructor(private readonly subjectTagService: SubjectTagService) {}

  @Get()
  public getFilteredSubjectTags(
    @Query() filterQuery: SubjectTagFilter,
  ): Promise<SubjectTagDto[]> {
    return this.subjectTagService.getFilteredSubjectTags(filterQuery);
  }
}
