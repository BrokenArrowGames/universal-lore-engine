import { AuthUser } from "@/module/auth/auth.dto";
import { TestBed } from "@automock/jest";
import { SubjectEntity, SubjectType } from "@db/entity/subject.entity";
import { SubjectService } from "@mod/subject/subject.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { MockDbUtils } from "@test/util/mock-repo";
import {
  EntityNotFoundError,
  QueryFailedError,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import { RandomMockSubject } from "./mock-subject";
import { DummyError } from "@test/util/dummy-error";
import { createAbility } from "@/module/auth/util/ability";
import { AuthAction } from "@/module/auth/util/auth-actions";
import {
  CreateSubjectRequest,
  UpdateSubjectRequest,
} from "@/module/subject/subject.dto";
import * as SubjectDtoModule from "@/module/subject/subject.dto";
import { RoleName } from "@/module/auth/role/types";
import { ConflictException, NotFoundException } from "@nestjs/common";
import {
  RandomArray,
  RandomElement,
  RandomIntInRange,
  RandomName,
  RandomStringOfLength,
} from "@test/util/random";
import { SubjectTagDto } from "@/module/subject/subject-tag.dto";

function RandomCreateRequst(opts?: {
  short_desc: boolean;
  note: boolean;
  tagCount?: number;
}): CreateSubjectRequest {
  return {
    display_name: RandomName(),
    private: true,
    key: RandomStringOfLength(8, 32),
    long_description: RandomStringOfLength(128, 256),
    short_description: opts?.short_desc
      ? RandomStringOfLength(8, 32)
      : undefined,
    note: opts?.note ? RandomStringOfLength(8, 32) : undefined,
    type: RandomElement(Object.values(SubjectType)),
    tags: RandomArray<SubjectTagDto>(
      () => ({ id: RandomIntInRange(1000, 9999), name: RandomName() }),
      opts?.tagCount ?? 0,
    ),
  };
}

describe("SubjectService", () => {
  let service: SubjectService;
  let repo: jest.MaybeMockedDeep<Repository<SubjectEntity>>;
  let qb: jest.MaybeMockedDeep<SelectQueryBuilder<SubjectEntity>>;

  const SubjectDtoFromEntity = jest.spyOn(
    SubjectDtoModule,
    "SubjectDtoFromEntity",
  );

  const adminAbility = createAbility({ id: 1, role: RoleName.ADMIN });
  const adminAuthUser = { id: 1, ability: adminAbility } as unknown as AuthUser;
  const userAbility = createAbility({ id: 2, role: RoleName.GUEST });
  const userAuthUser = { id: 2, ability: userAbility } as unknown as AuthUser;
  const guestAbility = createAbility({ id: 3, role: RoleName.GUEST });
  const guestAuthUser = { id: 3, ability: guestAbility } as unknown as AuthUser;

  beforeEach(async () => {
    const mockRepo = MockDbUtils<SubjectEntity>(RandomMockSubject);
    repo = mockRepo.repo;
    qb = mockRepo.qb as jest.MaybeMockedDeep<SelectQueryBuilder<SubjectEntity>>;
    const { unit } = TestBed.create(SubjectService)
      .mock(getRepositoryToken(SubjectEntity) as string)
      .using(repo)
      .compile();

    service = unit;
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createSubject", () => {
    it("should succeed on happy path", async () => {
      const authUser = userAuthUser;

      const request = RandomCreateRequst();
      const result = await service.createSubject(authUser, request);

      // expect entity to be created with validations enabled
      expect(repo.create).toHaveBeenCalled();
      // expect entity to be saved to database
      expect(repo.save).toHaveBeenCalled();
      // expect dto mapper to be called
      expect(SubjectDtoFromEntity).toHaveBeenCalled();

      // expect result
      return expect(result).toEqual({
        ...request,
        id: expect.any(Number),
        createdBy: expect.objectContaining({ id: authUser.id }),
        createdAt: expect.any(Date),
        modifiedBy: expect.objectContaining({ id: authUser.id }),
        modifiedAt: expect.any(Date),
      });
    });

    it("should throw ConflictException for contstraint violations", async () => {
      const authUser = adminAuthUser;
      const err = new QueryFailedError("", [], new Error());
      err.message = "violates unique constraint";
      repo.save.mockRejectedValue(err);

      await expect(
        service.createSubject(authUser, {} as CreateSubjectRequest),
      ).rejects.toThrow(ConflictException);

      expect(repo.save).toHaveBeenCalled();
    });

    it("should rethrow when unknown error occurs while finding entity", async () => {
      const authUser = userAuthUser;
      repo.save.mockRejectedValue(new DummyError());

      await expect(
        service.createSubject(authUser, {} as CreateSubjectRequest),
      ).rejects.toThrow(DummyError);

      return expect(repo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("getSubjectById", () => {
    it("should succeed on happy path", async () => {
      const authUser = guestAuthUser;
      const abilitySpy = jest.spyOn(authUser.ability, "relevantRuleFor");

      const result = await service.getSubjectById(authUser, 0);

      // expect auth checks to be run
      expect(abilitySpy).toHaveBeenCalledWith(
        AuthAction.READ,
        expect.any(SubjectEntity),
        undefined,
      );
      // expect database search
      expect(repo.findOneOrFail).toHaveBeenCalled();
      // expect dto mapper to be called
      expect(SubjectDtoFromEntity).toHaveBeenCalled();

      // expect result to not contain note
      expect(result.note).toBeFalsy();
      // expect result to be dto
      return expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
        }),
      );
    });

    // TODO: fix
    it.skip("should return notes for owner", async () => {
      const authUser = userAuthUser;
      const entity = RandomMockSubject({
        private: false,
        note: "random note",
        createdBy: { id: authUser.id },
      });
      repo.findOneOrFail.mockResolvedValue(entity);
      const abilitySpy = jest.spyOn(authUser.ability, "relevantRuleFor");

      const result = await service.getSubjectById(authUser, 0);

      // expect auth checks to be run
      expect(abilitySpy).toHaveBeenCalledWith(
        AuthAction.READ,
        entity,
        undefined,
      );
      // expect database search
      expect(repo.findOneOrFail).toHaveBeenCalled();
      // expect dto mapper to be called
      expect(SubjectDtoFromEntity).toHaveBeenCalled();

      // expect result to contain note
      expect(result.note).toBeTruthy();
      // expect result to be dto
      return expect(entity).toMatchObject(result);
    });

    it("should throw ForbiddenError when lacking permissions", async () => {
      const authUser = guestAuthUser;
      const abilitySpy = jest.spyOn(authUser.ability, "relevantRuleFor");
      const entity = RandomMockSubject({ private: true });
      repo.findOneOrFail.mockResolvedValue(entity);

      await expect(service.getSubjectById(authUser, 0)).rejects.toThrow(
        `Cannot execute "READ" on "SUBJECT"`,
      );

      // expect auth checks to be run
      expect(abilitySpy).toHaveBeenCalledWith(
        AuthAction.READ,
        entity,
        undefined,
      );
    });

    it("should throw NotFoundException when entity not found", async () => {
      const authUser = guestAuthUser;
      repo.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(SubjectEntity, {}),
      );
      await expect(service.getSubjectById(authUser, 0)).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it("should rethrow when unknown error occurs while finding entity", async () => {
      const authUser = guestAuthUser;
      repo.findOneOrFail.mockRejectedValue(new DummyError());
      await expect(service.getSubjectById(authUser, 0)).rejects.toThrow(
        DummyError,
      );
      expect(repo.findOneOrFail).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateSubject", () => {
    it("should succeed on happy path", async () => {
      const authUser = adminAuthUser;
      const entity = RandomMockSubject();
      repo.findOneOrFail.mockResolvedValue(entity);
      const abilitySpy = jest.spyOn(authUser.ability, "relevantRuleFor");
      repo.create.mockReturnValue(entity);
      repo.findOneByOrFail.mockResolvedValue(entity);

      const result = await service.updateSubject(
        authUser,
        0,
        {} as UpdateSubjectRequest,
      );

      // expect auth checks to be run
      expect(abilitySpy).toHaveBeenCalledWith(
        AuthAction.UPDATE,
        entity,
        undefined,
      );
      // expect entity validations to be run
      // expect modified by column to be updated
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // id: entity.id,
          modifiedBy: { id: authUser.id },
        }),
      );
      // expect database to be updated
      expect(repo.update).toHaveBeenCalledWith(0, expect.anything());
      // expect dto mapper to be called
      expect(SubjectDtoFromEntity).toHaveBeenCalled();

      // TODO: pass a real value to update funciton and compare here
      // expect result to be dto
      return expect(entity).toMatchObject(result);
    });

    it("should throw ForbiddenError when lacking permissions", async () => {
      const authUser = guestAuthUser;
      const abilitySpy = jest.spyOn(authUser.ability, "relevantRuleFor");
      const entity = RandomMockSubject();
      repo.findOneOrFail.mockResolvedValue(entity);

      await expect(
        service.updateSubject(authUser, 0, {} as UpdateSubjectRequest),
      ).rejects.toThrow(`Cannot execute "UPDATE" on "SUBJECT"`);

      // expect auth checks to be run
      expect(abilitySpy).toHaveBeenCalledWith(
        AuthAction.UPDATE,
        entity,
        undefined,
      );
    });

    it("should throw NotFoundException when entity not found", async () => {
      const authUser = adminAuthUser;
      repo.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(SubjectEntity, {}),
      );
      await expect(
        service.updateSubject(authUser, 0, {} as UpdateSubjectRequest),
      ).rejects.toThrow(NotFoundException);
      expect(repo.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it("should rethrow when unknown error occurs while finding original entity", async () => {
      const authUser = adminAuthUser;
      repo.findOneOrFail.mockRejectedValue(new DummyError());
      await expect(
        service.updateSubject(authUser, 0, {} as UpdateSubjectRequest),
      ).rejects.toThrow(DummyError);
      expect(repo.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it("should throw ConflictException for contstraint violations", async () => {
      const authUser = adminAuthUser;
      const entity = RandomMockSubject();
      repo.findOneOrFail.mockResolvedValue(entity);
      repo.create.mockReturnValue(entity);
      const err = new QueryFailedError("", [], new Error());
      err.message = "violates unique constraint";
      repo.update.mockRejectedValue(err);

      await expect(
        service.updateSubject(authUser, 0, {} as UpdateSubjectRequest),
      ).rejects.toThrow(ConflictException);

      expect(repo.update).toHaveBeenCalled();
    });

    it("should rethrow when unknown error occurs while updating entity", async () => {
      const authUser = adminAuthUser;
      const entity = RandomMockSubject();
      repo.findOneOrFail.mockResolvedValue(entity);
      repo.create.mockReturnValue(entity);
      repo.update.mockImplementation(() => {
        throw new DummyError();
      });

      await expect(
        service.updateSubject(authUser, 0, {} as UpdateSubjectRequest),
      ).rejects.toThrow(DummyError);

      expect(repo.update).toHaveBeenCalled();
    });

    it("should bubble when unknown error occurs while finding updated entity", async () => {
      const authUser = adminAuthUser;
      const entity = RandomMockSubject();
      repo.findOneOrFail
        .mockRejectedValue(new DummyError())
        .mockResolvedValueOnce(entity);
      repo.create.mockReturnValue(entity);

      await expect(
        service.updateSubject(authUser, 0, {} as UpdateSubjectRequest),
      ).rejects.toThrow(DummyError);

      expect(repo.update).toHaveBeenCalled();
      expect(repo.findOneOrFail).toHaveBeenCalledTimes(2);
    });
  });

  describe("deleteSubject", () => {
    it("should succeed on happy path", async () => {
      const authUser = adminAuthUser;
      const abilitySpy = jest.spyOn(authUser.ability, "relevantRuleFor");
      const entity = RandomMockSubject();
      repo.findOneOrFail.mockResolvedValue(entity);

      const result = await service.deleteSubject(authUser, 0);

      // expect auth checks to be run
      expect(abilitySpy).toHaveBeenCalledWith(
        AuthAction.DELETE_SOFT,
        entity,
        undefined,
      );
      // expect database to be updated
      expect(repo.softRemove).toHaveBeenCalledWith([entity]);
      // expect no return value
      return expect(result).toBeUndefined();
    });

    it("should throw ForbiddenError when lacking permissions", async () => {
      const authUser = guestAuthUser;
      const abilitySpy = jest.spyOn(authUser.ability, "relevantRuleFor");
      const entity = RandomMockSubject();
      repo.findOneOrFail.mockResolvedValue(entity);

      await expect(service.deleteSubject(authUser, 0)).rejects.toThrow(
        `Cannot execute "DELETE_SOFT" on "SUBJECT"`,
      );

      // expect auth checks to be run
      expect(abilitySpy).toHaveBeenCalledWith(
        AuthAction.DELETE_SOFT,
        entity,
        undefined,
      );
    });

    it("should throw NotFoundException when entity not found", async () => {
      const authUser = adminAuthUser;
      repo.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(SubjectEntity, {}),
      );
      await expect(service.deleteSubject(authUser, 0)).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it("should rethrow when unknown error occurs while finding original entity", async () => {
      const authUser = adminAuthUser;
      repo.findOneOrFail.mockRejectedValue(new DummyError());
      await expect(service.deleteSubject(authUser, 0)).rejects.toThrow(
        DummyError,
      );
      expect(repo.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it("should rethrow when unknown error occurs while removing entity", async () => {
      const authUser = adminAuthUser;
      const entity = RandomMockSubject();
      repo.findOneByOrFail.mockResolvedValue(entity);
      repo.softRemove.mockImplementation(() => {
        throw new DummyError();
      });

      await expect(service.deleteSubject(authUser, 0)).rejects.toThrow(
        DummyError,
      );

      expect(repo.softRemove).toHaveBeenCalled();
    });
  });

  describe("getFilteredSubjectList", () => {
    // TODO: more robust result checks
    it("should succeed on happy path - with no filter", async () => {
      const authUser = adminAuthUser;
      repo.find.mockResolvedValue(qb.getMany());

      const result = await service.getFilteredSubjectList(authUser);

      // expect database to be searched
      expect(qb.getMany).toHaveBeenCalled();
      // expect no tag filtering
      expect(qb.groupBy).toHaveBeenCalledTimes(0);
      // expect database to be searched
      expect(repo.find).toHaveBeenCalled();
      // expect no return value
      return expect(result).toHaveLength(2);
    });

    it("should succeed on happy path - with null filters", async () => {
      const authUser = adminAuthUser;
      repo.find.mockResolvedValue(qb.getMany());

      const result = await service.getFilteredSubjectList(authUser, {
        display_name: null,
        limit: null,
        page: null,
        tags: null,
        type: null,
      });

      // expect database to be searched
      expect(qb.getMany).toHaveBeenCalled();
      // expect no tag filtering
      expect(qb.groupBy).toHaveBeenCalledTimes(0);
      // expect database to be searched
      expect(repo.find).toHaveBeenCalled();
      // expect no return value
      return expect(result).toHaveLength(2);
    });

    it("should succeed on happy path - with tag filter", async () => {
      const authUser = adminAuthUser;
      repo.find.mockResolvedValue(qb.getMany());

      const result = await service.getFilteredSubjectList(authUser, {
        tags: "test,123",
      });

      // expect database to be searched
      expect(qb.getMany).toHaveBeenCalled();
      // expect no tag filtering
      expect(qb.groupBy).toHaveBeenCalledTimes(1);
      // expect database to be searched
      expect(repo.find).toHaveBeenCalled();
      // expect no return value
      return expect(result).toHaveLength(2);
    });

    it("should succeed on happy path - with all filters", async () => {
      const authUser = adminAuthUser;
      repo.find.mockResolvedValue(qb.getMany());

      const result = await service.getFilteredSubjectList(authUser, {
        display_name: "test",
        limit: 10,
        page: 1,
        tags: "test,123",
        type: SubjectType.IDEA,
      });

      // expect database to be searched
      expect(qb.getMany).toHaveBeenCalled();
      // expect no tag filtering
      expect(qb.groupBy).toHaveBeenCalledTimes(1);
      // expect database to be searched
      expect(repo.find).toHaveBeenCalled();
      // expect no return value
      return expect(result).toHaveLength(2);
    });

    // TODO: more robust filter integration testing, especially tags

    it("should redact private entities", () => {
      const authUser = guestAuthUser;
      const entities = [RandomMockSubject({ private: true })];
      const expected: SubjectEntity[] = [
        {
          id: entities[0].id,
          key: undefined,
          private: true,
          display_name: undefined,
          type: entities[0].type,
          tags: [],
          short_description: undefined,
        } as SubjectEntity,
      ];

      repo.find.mockResolvedValue(entities);
      qb.getMany.mockResolvedValue(entities);

      return expect(
        service.getFilteredSubjectList(authUser),
      ).resolves.toStrictEqual(expected);
    });

    it("should rethrow when unhandled exception occurs", () => {
      const authUser = adminAuthUser;
      repo.find.mockRejectedValue(new DummyError());
      qb.getMany.mockResolvedValue([]);

      return expect(service.getFilteredSubjectList(authUser)).rejects.toThrow(
        DummyError,
      );
    });
  });
});
