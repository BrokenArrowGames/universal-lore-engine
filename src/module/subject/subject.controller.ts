import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SubjectFilter, SubjectService } from './subject.service';
import {
  CreateSubjectRequest,
  SubjectDto,
  UpdateSubjectRequest,
} from './subject.dto';
import { AppRequest } from '@util/app-request';
import { AuthGuard } from '../auth/auth.guard';

// TODO: auth checks
@Controller('subject')
@UseGuards(AuthGuard)
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get()
  public getFilteredSubjects(
    @Query() filterQuery: SubjectFilter,
  ): Promise<SubjectDto[]> {
    return this.subjectService.getFilteredSubjects(filterQuery);
  }

  @Get(':id')
  public getSubjectById(@Param() params: { id: number }): Promise<SubjectDto> {
    return this.subjectService.getSubjectById(params.id);
  }

  @Post()
  public createSubject(
    @Req() req: AppRequest,
    @Body() user: CreateSubjectRequest,
  ): Promise<SubjectDto> {
    return this.subjectService.createSubject(req.user, user);
  }

  @Put(':id')
  public updateSubject(
    @Req() req: AppRequest,
    @Param() params: { id: number },
    @Body() user: UpdateSubjectRequest,
  ): Promise<SubjectDto> {
    return this.subjectService.updateSubject(req.user, params.id, user);
  }

  @Delete(':id')
  public deleteSubject(@Param() params: { id: number }): Promise<void> {
    return this.subjectService.deleteSubject(params.id);
  }
}
