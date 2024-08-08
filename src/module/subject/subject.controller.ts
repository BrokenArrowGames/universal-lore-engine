import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { SubjectFilter, SubjectService } from "./subject.service";
import {
  CreateSubjectRequest,
  SubjectDto,
  UpdateSubjectRequest,
} from "./subject.dto";
import { AppRequest } from "@util/app-request";
import { AuthGuard } from "@mod/auth/auth.guard";
import { ForbiddenError } from "@casl/ability";
import { AuthAction } from "@mod/auth/util/auth-actions";
import { AuthSubject } from "@mod/auth/util/auth-subjects";
import { AllowGuestSession } from "@mod/auth/decorator/allow-guest-session";

@Controller("subject")
@UseGuards(AuthGuard)
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  public createSubject(
    @Req() req: AppRequest,
    @Body() body: CreateSubjectRequest,
  ): Promise<SubjectDto> {
    ForbiddenError.from(req.user.ability).throwUnlessCan(
      AuthAction.CREATE,
      AuthSubject.SUBJECT,
    );
    return this.subjectService.createSubject(req.user, body);
  }

  @Get(":id")
  @AllowGuestSession()
  public readSubject(
    @Req() req: AppRequest,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<SubjectDto> {
    ForbiddenError.from(req.user.ability).throwUnlessCan(
      AuthAction.READ,
      AuthSubject.SUBJECT,
    );
    return this.subjectService.getSubjectById(req.user, id);
  }

  @Put(":id")
  public updateSubject(
    @Req() req: AppRequest,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateSubjectRequest,
  ): Promise<SubjectDto> {
    ForbiddenError.from(req.user.ability).throwUnlessCan(
      AuthAction.UPDATE,
      AuthSubject.SUBJECT,
    );
    return this.subjectService.updateSubject(req.user, id, body);
  }

  @Delete(":id")
  public deleteSubject(
    @Req() req: AppRequest,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<void> {
    ForbiddenError.from(req.user.ability).throwUnlessCan(
      AuthAction.DELETE_SOFT,
      AuthSubject.SUBJECT,
    );
    return this.subjectService.deleteSubject(req.user, id);
  }

  @Get()
  @AllowGuestSession()
  public listSubjects(
    @Req() req: AppRequest,
    @Query() filterQuery: SubjectFilter,
  ): Promise<SubjectDto[]> {
    ForbiddenError.from(req.user.ability).throwUnlessCan(
      AuthAction.LIST,
      AuthSubject.SUBJECT,
    );
    return this.subjectService.getFilteredSubjectList(req.user, filterQuery);
  }
}
