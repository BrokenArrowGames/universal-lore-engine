import { Controller, Get, Query, Req } from "@nestjs/common";
import { SubjectTagFilter, SubjectTagService } from "./subject-tag.service";
import { SubjectTagDto } from "./subject-tag.dto";
import { AppRequest } from "@/util/app-request";

@Controller("subject-tag")
export class SubjectTagController {
  constructor(private readonly subjectTagService: SubjectTagService) {}

  @Get()
  public listSubjectTags(
    @Req() _req: AppRequest,
    @Query() filterQuery: SubjectTagFilter,
  ): Promise<SubjectTagDto[]> {
    return this.subjectTagService.getFilteredSubjectTagList(filterQuery);
  }
}
