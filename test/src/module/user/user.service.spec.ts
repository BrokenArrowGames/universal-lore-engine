import { TestBed } from "@automock/jest";
import { UserEntity } from "@db/entity/user.entity";
import { EntityValidationError } from "@db/entity/util/entity-validation-error";
import { AuthUser } from "@mod/auth/auth.dto";
import { AuthService } from "@mod/auth/auth.service";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserDto,
} from "@mod/user/user.dto";
import { UserService } from "@mod/user/user.service";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DummyError } from "@test/util/dummy-error";
import { MockDbUtils } from "@test/util/mock-repo";
import { RandomMockUser } from "./mock-user";
import { ValidationError } from "class-validator";
import { EntityNotFoundError, QueryFailedError, Repository } from "typeorm";
import { RoleName } from "@/module/auth/role/types";

describe("UserService", () => {
  let service: UserService;
  let _authService: jest.Mocked<AuthService>;
  let repo: jest.MaybeMockedDeep<Repository<UserEntity>>;

  beforeEach(async () => {
    const mockRepo = MockDbUtils<UserEntity>(RandomMockUser);
    repo = mockRepo.repo;

    const { unit, unitRef } = TestBed.create(UserService)
      .mock(getRepositoryToken(UserEntity) as string)
      .using(repo)
      .compile();

    service = unit;
    _authService = unitRef.get(AuthService);
  });

  it("should be defined", () => {
    return expect(service).toBeDefined();
  });

  describe("getFilteredUsers", () => {
    it("should return empty array when no entities are found", () => {
      repo.find.mockResolvedValue([]);

      return expect(
        service.getFilteredUserList({} as AuthUser),
      ).resolves.toStrictEqual([]);
    });

    it("should allow null filter properties", () => {
      repo.find.mockResolvedValue([]);

      return expect(
        service.getFilteredUserList({} as AuthUser, {
          name: null,
          limit: null,
          page: null,
        }),
      ).resolves.toStrictEqual([]);
    });

    it("should allow filter by name", () => {
      repo.find.mockResolvedValue([]);

      return expect(
        service.getFilteredUserList({} as AuthUser, { name: "test" }),
      ).resolves.toStrictEqual([]);
    });

    it("should correctly map to dto when entities are found", () => {
      const entities = [RandomMockUser(), RandomMockUser(), RandomMockUser()];
      const expected: UserDto[] = [
        { id: entities[0].id, name: entities[0].name },
        { id: entities[1].id, name: entities[1].name },
        { id: entities[2].id, name: entities[2].name },
      ];

      repo.find.mockResolvedValue(entities);

      return expect(
        service.getFilteredUserList({} as AuthUser),
      ).resolves.toStrictEqual(expected);
    });

    it("should rethrow when unhandled exception occurs", () => {
      repo.find.mockRejectedValue(new DummyError());

      return expect(
        service.getFilteredUserList({} as AuthUser),
      ).rejects.toThrow(DummyError);
    });
  });

  describe("getUserById", () => {
    it("should correctly map to dto when entity is present", () => {
      const entity = RandomMockUser();
      const expected: UserDto = {
        id: entity.id,
        name: entity.name,
      };

      repo.findOneOrFail.mockResolvedValue(entity);

      return expect(
        service.getUserById({} as AuthUser, expected.id),
      ).resolves.toStrictEqual(expected);
    });

    it("should throw NotFoundException when entity is missing", () => {
      repo.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(UserEntity, undefined),
      );

      return expect(service.getUserById({} as AuthUser, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should rethrow when unhandled exception occurs", () => {
      repo.findOneOrFail.mockRejectedValue(new DummyError());

      return expect(service.getUserById({} as AuthUser, 1)).rejects.toThrow(
        DummyError,
      );
    });
  });

  describe("createUser", () => {
    it("should call entity validations", async () => {
      const entity = RandomMockUser();

      repo.manager.save.mockResolvedValue(entity);

      await service.createUser(
        {} as AuthUser,
        { password: "dummy password" } as CreateUserRequest,
      );
      return expect(repo.create).toHaveBeenCalledTimes(1);
    });

    it("should use a transaction", async () => {
      const entity = RandomMockUser();

      repo.manager.save.mockResolvedValue(entity);

      await service.createUser(
        {} as AuthUser,
        { password: "dummy password" } as CreateUserRequest,
      );
      return expect(repo.manager.transaction).toHaveBeenCalledTimes(1);
    });

    it("should call cognito create user function", async () => {
      const entity = RandomMockUser();

      repo.manager.save.mockResolvedValue(entity);

      await service.createUser(
        {} as AuthUser,
        { password: "dummy password" } as CreateUserRequest,
      );
      return expect(_authService.createUser).toHaveBeenCalledTimes(1);
    });

    it("should correctly map to dto when entity is created", () => {
      const entity = RandomMockUser();
      const expected: UserDto = {
        id: entity.id,
        name: entity.name,
      };

      repo.manager.save.mockResolvedValue(entity);

      return expect(
        service.createUser({} as AuthUser, {
          ...entity,
          role: RoleName.USER,
          password: "dummy password",
        }),
      ).resolves.toStrictEqual(expected);
    });

    it("should throw EntityValidationError when password is missing", () => {
      return expect(
        service.createUser({} as AuthUser, {} as CreateUserRequest),
      ).rejects.toThrow(EntityValidationError);
    });

    it.skip("should rethrow exception when entity validation fails", () => {
      repo.manager.save.mockRejectedValue(new ValidationError());

      return expect(
        service.createUser(
          {} as AuthUser,
          { password: "dummy password" } as CreateUserRequest,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ConflictException for contstraint violations", () => {
      const err = new QueryFailedError("", [], new Error());
      err.message = "violates unique constraint";
      repo.manager.save.mockRejectedValue(err);

      return expect(
        service.createUser(
          {} as AuthUser,
          { password: "dummy password" } as CreateUserRequest,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it("should rethrow when unhandled exception occurs", () => {
      repo.manager.save.mockRejectedValue(new DummyError());

      return expect(
        service.createUser(
          {} as AuthUser,
          { password: "dummy password" } as CreateUserRequest,
        ),
      ).rejects.toThrow(DummyError);
    });
  });

  describe("updateUser", () => {
    it("should call entity validations", async () => {
      const entity = RandomMockUser();

      repo.findOneByOrFail.mockResolvedValue(entity);

      await service.updateUser({} as AuthUser, 0, {} as UpdateUserRequest);
      return expect(repo.create).toHaveBeenCalledTimes(1);
    });

    it("should use a transaction", async () => {
      const entity = RandomMockUser();

      repo.findOneByOrFail.mockResolvedValue(entity);

      await service.updateUser({} as AuthUser, 0, {} as UpdateUserRequest);
      return expect(repo.manager.transaction).toHaveBeenCalledTimes(1);
    });

    it("should update entity in database", async () => {
      const entity = RandomMockUser();

      repo.findOneByOrFail.mockResolvedValue(entity);

      await service.updateUser({} as AuthUser, 0, {} as UpdateUserRequest);
      return expect(repo.manager.update).toHaveBeenCalledTimes(1);
    });

    it("should update password in cognito", async () => {
      const entity = RandomMockUser();

      repo.findOneByOrFail.mockResolvedValue(entity);

      await service.updateUser({} as AuthUser, 0, {
        password: "dummy password",
      } as UpdateUserRequest);
      return expect(_authService.setPassword).toHaveBeenCalledTimes(1);
    });

    it("should update email in cognito", async () => {
      const entity = RandomMockUser();

      repo.findOneByOrFail.mockResolvedValue(entity);

      await service.updateUser({} as AuthUser, 0, {
        email: "dummy@example.com",
      } as UpdateUserRequest);
      return expect(_authService.setEmail).toHaveBeenCalledTimes(1);
    });

    it("should correctly map to dto when entity is updated", () => {
      const entity = RandomMockUser();
      const expected: UserDto = {
        id: entity.id,
        name: entity.name,
      };

      repo.manager.save.mockResolvedValue(entity);
      repo.findOneByOrFail.mockResolvedValue(entity);

      return expect(
        service.updateUser({} as AuthUser, 0, {
          ...entity,
        }),
      ).resolves.toStrictEqual(expected);
    });

    it("should throw NotFoundException when entity not found", () => {
      repo.findOneByOrFail.mockRejectedValue(new Error());

      return expect(
        service.updateUser({} as AuthUser, 0, {} as UpdateUserRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it.skip("should rethrow exception when entity validation fails", () => {
      repo.manager.update.mockRejectedValue(new ValidationError());

      return expect(
        service.updateUser({} as AuthUser, 0, {} as UpdateUserRequest),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ConflictException for contstraint violations", () => {
      const err = new QueryFailedError("", [], new Error());
      err.message = "violates unique constraint";
      repo.manager.update.mockRejectedValue(err);

      return expect(
        service.updateUser({} as AuthUser, 0, {} as UpdateUserRequest),
      ).rejects.toThrow(ConflictException);
    });

    it("should rethrow when unhandled exception occurs", () => {
      repo.manager.update.mockRejectedValue(new DummyError());

      return expect(
        service.updateUser({} as AuthUser, 0, {} as UpdateUserRequest),
      ).rejects.toThrow(DummyError);
    });
  });

  describe("deleteUser", () => {
    it("should use a transaction", async () => {
      const entity = RandomMockUser();

      repo.manager.findOneByOrFail.mockResolvedValue(entity);

      await service.deleteUser({} as AuthUser, 0);
      return expect(repo.manager.transaction).toHaveBeenCalledTimes(1);
    });

    it("should remove user from cognito", async () => {
      const entity = RandomMockUser();

      repo.manager.findOneByOrFail.mockResolvedValue(entity);

      await service.deleteUser({} as AuthUser, 0);
      return expect(_authService.deleteUser).toHaveBeenCalledTimes(1);
    });

    it("should remove entity from database", async () => {
      const entity = RandomMockUser();

      repo.manager.findOneByOrFail.mockResolvedValue(entity);

      await service.deleteUser({} as AuthUser, 0);
      return expect(repo.manager.softRemove).toHaveBeenCalledTimes(1);
    });

    it("should throw NotFoundException when entity not found", () => {
      repo.manager.findOneByOrFail.mockRejectedValue(
        new EntityNotFoundError(null, null),
      );

      return expect(service.deleteUser({} as AuthUser, 0)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should rethrow when unhandled exception occurs", () => {
      const entity = RandomMockUser();

      repo.manager.findOneByOrFail.mockResolvedValue(entity);
      repo.manager.softRemove.mockRejectedValue(new DummyError());

      return expect(service.deleteUser({} as AuthUser, 0)).rejects.toThrow(
        DummyError,
      );
    });
  });
});
