import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Like,
  QueryFailedError,
  EntityNotFoundError,
} from 'typeorm';
import { filterProps, FilterQuery } from '@util/filter-query';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserDto,
  UserDtoFromEntity,
} from './user.dto';
import { UserEntity } from '@db/entity/user.entity';
import { AuthUser } from '../auth/auth.dto';
import { AuthService } from '../auth/auth.service';
import { EntityValidationError } from '@db/entity/util/entity-validation-error';

export type UserFilter = FilterQuery<UserDto, 'name'>;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly authService: AuthService,
  ) {}

  public async getFilteredUsers(filterQuery: UserFilter): Promise<UserDto[]> {
    const entities = await this.userRepo.find({
      select: { id: true, name: true },
      where: {
        name: filterQuery.name ? Like(`%${filterQuery.name}%`) : null,
      },
      ...filterProps(filterQuery),
    });

    return entities.map(UserDtoFromEntity);
  }

  public async getUserById(id: number): Promise<UserDto> {
    try {
      const entity = await this.userRepo.findOneOrFail({
        where: { id },
        relations: ['created_by', 'modified_by'],
      });
      return UserDtoFromEntity(entity);
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new NotFoundException('record not found', { cause: err });
      } else {
        throw err;
      }
    }
  }

  public async createUser(
    currentUser: AuthUser,
    reqData: CreateUserRequest,
  ): Promise<UserDto> {
    const newUser = this.userRepo.create({
      ...reqData,
      created_by: { id: currentUser.id },
      modified_by: { id: currentUser.id },
    });
    if (!reqData.password) {
      throw new EntityValidationError(newUser, ['password required']);
    }

    try {
      const result = await this.userRepo.manager.transaction(
        async (manager) => {
          const result = await manager.save(newUser);
          await this.authService.createUser(
            reqData.email,
            reqData.name,
            reqData.password,
          );
          return result;
        },
      );
      return UserDtoFromEntity(result);
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

  public async updateUser(
    currentUser: AuthUser,
    userId: number,
    userData: UpdateUserRequest,
  ): Promise<UserDto> {
    try {
      await this.userRepo.findOneByOrFail({ id: userId });
    } catch (err) {
      throw new NotFoundException('record not found', { cause: err });
    }

    const newUser = this.userRepo.create({
      ...userData,
      created_by: { id: currentUser.id },
      modified_by: { id: currentUser.id },
    });

    await this.userRepo.manager.transaction(async (manager) => {
      try {
        await manager.update(UserEntity, userId, newUser);
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
      if (userData.email) {
        await this.authService.setEmail(userData.name, userData.email);
      }
      if (userData.password) {
        await this.authService.setPassword(userData.name, userData.password);
      }
    });

    const result = await this.userRepo.findOneByOrFail({ id: userId });
    return UserDtoFromEntity(result);
  }

  public async deleteUser(userId: number): Promise<void> {
    try {
      await this.userRepo.manager.transaction(async (manager) => {
        const userEntity = await manager.findOneByOrFail(UserEntity, {
          id: userId,
        });
        this.authService.deleteUser(userEntity.name);
        await manager.remove([userEntity]);
      });
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new NotFoundException('record not found', { cause: err });
      } else {
        throw err;
      }
    }
  }
}
