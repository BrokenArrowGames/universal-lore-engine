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
import { UserFilter, UserService } from './user.service';
import { CreateUserRequest, UpdateUserRequest, UserDto } from './user.dto';
import { AppRequest } from '@util/app-request';
import { AuthGuard } from '../auth/auth.guard';

// TODO: auth checks
@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  public getFilteredUsers(
    @Query() filterQuery: UserFilter,
  ): Promise<UserDto[]> {
    return this.userService.getFilteredUsers(filterQuery);
  }

  @Get(':id')
  public getUserById(@Param() params: { id: number }): Promise<UserDto> {
    return this.userService.getUserById(params.id);
  }

  @Post()
  public createUser(
    @Req() req: AppRequest,
    @Body() user: CreateUserRequest,
  ): Promise<UserDto> {
    return this.userService.createUser(req.user, user);
  }

  @Put(':id')
  public updateUser(
    @Req() req: AppRequest,
    @Param() params: { id: number },
    @Body() user: UpdateUserRequest,
  ): Promise<UserDto> {
    return this.userService.updateUser(req.user, params.id, user);
  }

  @Delete(':id')
  public deleteUser(@Param() params: { id: number }): Promise<void> {
    return this.userService.deleteUser(params.id);
  }
}
