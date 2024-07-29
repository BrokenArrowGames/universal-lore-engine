import { TestBed } from '@automock/jest';
import { UserEntity } from '@db/entity/user.entity';
import { EntityValidationError } from '@db/entity/util/entity-validation-error';
import { AuthUser } from '@mod/auth/auth.dto';
import { AuthService } from '@mod/auth/auth.service';
import { CreateUserRequest, UpdateUserRequest, UserDto } from '@mod/user/user.dto';
import { UserService } from '@mod/user/user.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DummyError } from '@test/util/dummy-error';
import { MockDbRepo, RandomMockUser } from '@test/util/mock-user';
import { rejects } from 'assert';
import { ValidationError } from 'class-validator';
import { BaseEntity, EntityNotFoundError, QueryFailedError, Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let _authService: jest.Mocked<AuthService>;
  let userRepo: jest.MaybeMockedDeep<Repository<UserEntity>>;

  beforeEach(async () => {
    userRepo = MockDbRepo<UserEntity>();
    const { unit, unitRef } = TestBed.create(UserService)
      .mock(getRepositoryToken(UserEntity) as string)
      .using(userRepo)
      .compile();

    service = unit;
    _authService = unitRef.get(AuthService);
  });

  it('should be defined', () => {
    return expect(service).toBeDefined();
  });
  
  describe('getFilteredUsers', () => {
    it('should return empty array when no users are found', () => {
      userRepo.find.mockResolvedValue([]);
  
      return expect(service.getFilteredUsers())
        .resolves.toStrictEqual([]);
    });
    
    it('should allow null filter properties', () => {
      userRepo.find.mockResolvedValue([]);
  
      return expect(service.getFilteredUsers({ name: null, limit: null, page: null }))
        .resolves.toStrictEqual([]);
    });
    
    it('should allow filter by name', () => {
      userRepo.find.mockResolvedValue([]);
  
      return expect(service.getFilteredUsers({ name: "test" }))
        .resolves.toStrictEqual([]);
    });

    it('should correctly map to dto when users are found', () => {
      const users = [
        RandomMockUser(),
        RandomMockUser(),
        RandomMockUser(),
      ];
      const expected: UserDto[] = [
        { id: users[0].id, name: users[0].name },
        { id: users[1].id, name: users[1].name },
        { id: users[2].id, name: users[2].name },
      ];

      userRepo.find.mockResolvedValue(users);
  
      return expect(service.getFilteredUsers())
        .resolves.toStrictEqual(expected);
    });
    
    it('should rethrow when unhandled exception occurs', () => {
      userRepo.find.mockRejectedValue(new DummyError());
  
      return expect(service.getFilteredUsers())
        .rejects.toThrow(DummyError);
    });
  });

  describe('getUserById', () => {
    it('should correctly map to dto when user is present', () => {
      const user = RandomMockUser();
      const expected: UserDto = {
        id: user.id,
        name: user.name
      };
  
      userRepo.findOneOrFail.mockResolvedValue(user);
  
      return expect(service.getUserById(expected.id))
        .resolves.toStrictEqual(expected);
    });

    it('should throw NotFoundException when user is missing', () => {
      userRepo.findOneOrFail.mockRejectedValue(new EntityNotFoundError(UserEntity, undefined));
      
      return expect(service.getUserById(1))
        .rejects.toThrow(NotFoundException);
    });
    
    it('should rethrow when unhandled exception occurs', () => {
      userRepo.findOneOrFail.mockRejectedValue(new DummyError());
      
      return expect(service.getUserById(1))
        .rejects.toThrow(DummyError);
    });
  });
  
  describe('createUser', () => {
    it('should call entity validations', async () => {
      const user = RandomMockUser();

      userRepo.manager.save.mockResolvedValue(user);

      await service.createUser({} as AuthUser, { password: "dummy password" } as CreateUserRequest);
      return expect(userRepo.create).toHaveBeenCalledTimes(1);
    });

    it('should use a transaction', async () => {
      const user = RandomMockUser();
        
      userRepo.manager.save.mockResolvedValue(user);

      await service.createUser({} as AuthUser, { password: "dummy password" } as CreateUserRequest);
      return expect(userRepo.manager.transaction).toHaveBeenCalledTimes(1);
    });

    it('should call cognito create user function', async () => {
      const user = RandomMockUser();
        
      userRepo.manager.save.mockResolvedValue(user);

      await service.createUser({} as AuthUser, { password: "dummy password" } as CreateUserRequest);
      return expect(_authService.createUser).toHaveBeenCalledTimes(1);
    });

    it('should correctly map to dto when user is created', () => {
      const user = RandomMockUser();
      const expected: UserDto = {
        id: user.id,
        name: user.name
      };
  
      userRepo.manager.save.mockResolvedValue(user);

      return expect(service.createUser({} as AuthUser, {
        ...user,
        password: "dummy password"
      })).resolves.toStrictEqual(expected);
    });

    it('should throw EntityValidationError when password is missing', () => {
      return expect(service.createUser({} as AuthUser, {} as CreateUserRequest))
        .rejects.toThrow(EntityValidationError);
    });

    it.skip('should rethrow exception when entity validation fails', () => {
      userRepo.manager.save.mockRejectedValue(new ValidationError());
      
      return expect(service.createUser({} as AuthUser, { password: "dummy password" } as CreateUserRequest))
        .rejects.toThrow(ValidationError);
    });
    
    it('should throw ConflictException for contstraint violations', () => {
      const err = new QueryFailedError("", [], new Error());
      err.message = "violates unique constraint";
      userRepo.manager.save.mockRejectedValue(err);
      
      return expect(service.createUser({} as AuthUser, { password: "dummy password" } as CreateUserRequest))
        .rejects.toThrow(ConflictException);
    });

    it('should rethrow when unhandled exception occurs', () => {
      userRepo.manager.save.mockRejectedValue(new DummyError());
      
      return expect(service.createUser({} as AuthUser, { password: "dummy password" } as CreateUserRequest))
        .rejects.toThrow(DummyError);
    });
  });
  
  describe('updateUser', () => {
    it('should call entity validations', async () => {
      const user = RandomMockUser();

      userRepo.findOneByOrFail.mockResolvedValue(user);

      await service.updateUser({} as AuthUser, 0, {} as UpdateUserRequest);
      return expect(userRepo.create).toHaveBeenCalledTimes(1);
    });

    it('should use a transaction', async () => {
      const user = RandomMockUser();
        
      userRepo.findOneByOrFail.mockResolvedValue(user);

      await service.updateUser({} as AuthUser, 0, {} as UpdateUserRequest);
      return expect(userRepo.manager.transaction).toHaveBeenCalledTimes(1);
    });

    it('should update user in database', async () => {
      const user = RandomMockUser();
        
      userRepo.findOneByOrFail.mockResolvedValue(user);

      await service.updateUser({} as AuthUser, 0, {} as UpdateUserRequest);
      return expect(userRepo.manager.update).toHaveBeenCalledTimes(1);
    });

    it('should update user password in cognito', async () => {
      const user = RandomMockUser();
        
      userRepo.findOneByOrFail.mockResolvedValue(user);

      await service.updateUser({} as AuthUser, 0, { password: "dummy password" } as UpdateUserRequest);
      return expect(_authService.setPassword).toHaveBeenCalledTimes(1);
    });

    it('should update user email in cognito', async () => {
      const user = RandomMockUser();
        
      userRepo.findOneByOrFail.mockResolvedValue(user);

      await service.updateUser({} as AuthUser, 0, { email: "dummy@example.com" } as UpdateUserRequest);
      return expect(_authService.setEmail).toHaveBeenCalledTimes(1);
    });

    it('should correctly map to dto when user is updated', () => {
      const user = RandomMockUser();
      const expected: UserDto = {
        id: user.id,
        name: user.name
      };
  
      userRepo.manager.save.mockResolvedValue(user);
      userRepo.findOneByOrFail.mockResolvedValue(user);

      return expect(service.updateUser({} as AuthUser, 0, {
        ...user
      })).resolves.toStrictEqual(expected);
    });

    it('should throw NotFoundException when entity not found', () => {
      userRepo.findOneByOrFail.mockRejectedValue(new Error());
      
      return expect(service.updateUser({} as AuthUser, 0, {} as UpdateUserRequest))
        .rejects.toThrow(NotFoundException);
    });

    it.skip('should rethrow exception when entity validation fails', () => {
      userRepo.manager.update.mockRejectedValue(new ValidationError());
      
      return expect(service.updateUser({} as AuthUser, 0, {} as UpdateUserRequest))
        .rejects.toThrow(ValidationError);
    });
    
    it('should throw ConflictException for contstraint violations', () => {
      const err = new QueryFailedError("", [], new Error());
      err.message = "violates unique constraint";
      userRepo.manager.update.mockRejectedValue(err);
      
      return expect(service.updateUser({} as AuthUser, 0, {} as UpdateUserRequest))
        .rejects.toThrow(ConflictException);
    });

    it('should rethrow when unhandled exception occurs', () => {
      userRepo.manager.update.mockRejectedValue(new DummyError());
      
      return expect(service.updateUser({} as AuthUser, 0, {} as UpdateUserRequest))
        .rejects.toThrow(DummyError);
    });
  });
  
  describe('deleteUser', () => {
    it('should use a transaction', async () => {
      const user = RandomMockUser();
        
      userRepo.manager.findOneByOrFail.mockResolvedValue(user);

      await service.deleteUser({} as AuthUser, 0);
      return expect(userRepo.manager.transaction).toHaveBeenCalledTimes(1);
    });

    it('should remove user from cognito', async () => {
      const user = RandomMockUser();
        
      userRepo.manager.findOneByOrFail.mockResolvedValue(user);

      await service.deleteUser({} as AuthUser, 0);
      return expect(_authService.deleteUser).toHaveBeenCalledTimes(1);
    });

    it('should remove user from database', async () => {
      const user = RandomMockUser();
        
      userRepo.manager.findOneByOrFail.mockResolvedValue(user);

      await service.deleteUser({} as AuthUser, 0);
      return expect(userRepo.manager.remove).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when entity not found', () => {
      userRepo.manager.findOneByOrFail.mockRejectedValue(new EntityNotFoundError(null, null));
      
      return expect(service.deleteUser({} as AuthUser, 0))
        .rejects.toThrow(NotFoundException);
    });

    it('should rethrow when unhandled exception occurs', () => {
      const user = RandomMockUser();
        
      userRepo.manager.findOneByOrFail.mockResolvedValue(user);
      userRepo.manager.remove.mockRejectedValue(new DummyError());
      
      return expect(service.deleteUser({} as AuthUser, 0))
        .rejects.toThrow(DummyError);
    });
  });
});
