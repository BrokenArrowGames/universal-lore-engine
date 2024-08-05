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
import { UserFilter, UserService } from "./user.service";
import { CreateUserRequest, UpdateUserRequest, UserDto } from "./user.dto";
import { AppRequest } from "@util/app-request";
import { AuthGuard } from "@mod/auth/auth.guard";
import { ForbiddenError, subject } from "@casl/ability";
import { AuthAction } from "@mod/auth/util/auth-actions";
import { AuthSubject } from "@mod/auth/util/auth-subjects";

// TODO: auth checks
@Controller("user")
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  public createUser(
    @Req() req: AppRequest,
    @Body() body: CreateUserRequest,
  ): Promise<UserDto> {
    ForbiddenError.from(req.user.ability).throwUnlessCan(
      AuthAction.CREATE,
      AuthSubject.USER,
    );
    return this.userService.createUser(req.user, body);
  }

  @Get(":id")
  public readUser(
    @Req() req: AppRequest,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<UserDto> {
    ForbiddenError.from(req.user.ability).throwUnlessCan(
      AuthAction.READ,
      subject(AuthSubject.USER, { id }),
    );
    return this.userService.getUserById(req.user, id);
  }

  @Put(":id")
  public updateUser(
    @Req() req: AppRequest,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateUserRequest,
  ): Promise<UserDto> {
    ForbiddenError.from(req.user.ability).throwUnlessCan(
      AuthAction.UPDATE,
      subject(AuthSubject.USER, { id }),
    );
    return this.userService.updateUser(req.user, id, body);
  }

  @Delete(":id")
  public deleteUser(
    @Req() req: AppRequest,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<void> {
    ForbiddenError.from(req.user.ability).throwUnlessCan(
      AuthAction.DELETE,
      subject(AuthSubject.USER, { id }),
    );
    return this.userService.deleteUser(req.user, id);
  }

  @Get()
  public listUsers(
    @Req() req: AppRequest,
    @Query() filterQuery: UserFilter,
  ): Promise<UserDto[]> {
    ForbiddenError.from(req.user.ability).throwUnlessCan(
      AuthAction.LIST,
      AuthSubject.USER,
    );
    return this.userService.getFilteredUserList(req.user, filterQuery);
  }
}
