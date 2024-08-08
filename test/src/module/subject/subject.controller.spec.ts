import { TestBed } from "@automock/jest";
import { createMongoAbility } from "@casl/ability";
import { AppAbility } from "@mod/auth/util/ability";
import { AuthAction } from "@mod/auth/util/auth-actions";
import { AuthSubject } from "@mod/auth/util/auth-subjects";
import { SubjectController } from "@mod/subject/subject.controller";
import {
  CreateSubjectRequest,
  UpdateSubjectRequest,
} from "@mod/subject/subject.dto";
import { SubjectService } from "@mod/subject/subject.service";
import { AppRequest } from "@util/app-request";

describe("SubjectController", () => {
  let controller: SubjectController;
  let service: SubjectService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(SubjectController).compile();

    controller = unit;
    service = unitRef.get(SubjectService);
  });

  it("should be defined", () => {
    return expect(controller).toBeDefined();
  });

  describe("createSubject", () => {
    const ability = createMongoAbility<AppAbility>([
      { action: AuthAction.CREATE, subject: AuthSubject.SUBJECT },
    ]);

    it("should throw ForbiddenError when auth fails", () => {
      const ability = createMongoAbility();
      return expect(() =>
        controller.createSubject(
          { user: { ability } } as unknown as AppRequest,
          {} as CreateSubjectRequest,
        ),
      ).toThrow(`Cannot execute "CREATE" on "SUBJECT"`);
    });

    it("should perform basic auth check", async () => {
      const abilitySpy = jest.spyOn(ability, "relevantRuleFor");
      await controller.createSubject(
        { user: { ability } } as unknown as AppRequest,
        {} as CreateSubjectRequest,
      );
      return expect(abilitySpy).toHaveBeenCalledWith(
        AuthAction.CREATE,
        AuthSubject.SUBJECT,
        undefined,
      );
    });

    it("calls subject service", async () => {
      await controller.createSubject(
        { user: { ability: ability } } as unknown as AppRequest,
        {} as CreateSubjectRequest,
      );
      expect(service.createSubject).toHaveBeenCalledTimes(1);
    });
  });

  describe("readSubject", () => {
    const ability = createMongoAbility<AppAbility>([
      { action: AuthAction.READ, subject: AuthSubject.SUBJECT },
    ]);

    it("should throw ForbiddenError when auth fails", () => {
      const ability = createMongoAbility();
      return expect(() =>
        controller.readSubject(
          { user: { ability } } as unknown as AppRequest,
          0,
        ),
      ).toThrow(`Cannot execute "READ" on "SUBJECT"`);
    });

    it("should perform basic auth check", async () => {
      const abilitySpy = jest.spyOn(ability, "relevantRuleFor");
      await controller.readSubject(
        { user: { ability } } as unknown as AppRequest,
        0,
      );
      return expect(abilitySpy).toHaveBeenCalledWith(
        AuthAction.READ,
        AuthSubject.SUBJECT,
        undefined,
      );
    });

    it("calls subject service", async () => {
      await controller.readSubject(
        { user: { ability: ability } } as unknown as AppRequest,
        0,
      );
      expect(service.getSubjectById).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateSubject", () => {
    const ability = createMongoAbility<AppAbility>([
      { action: AuthAction.UPDATE, subject: AuthSubject.SUBJECT },
    ]);

    it("should throw ForbiddenError when auth fails", () => {
      const ability = createMongoAbility();
      return expect(() =>
        controller.updateSubject(
          { user: { ability } } as unknown as AppRequest,
          0,
          {} as UpdateSubjectRequest,
        ),
      ).toThrow(`Cannot execute "UPDATE" on "SUBJECT"`);
    });

    it("should perform basic auth check", async () => {
      const abilitySpy = jest.spyOn(ability, "relevantRuleFor");
      await controller.updateSubject(
        { user: { ability } } as unknown as AppRequest,
        0,
        {} as UpdateSubjectRequest,
      );
      return expect(abilitySpy).toHaveBeenCalledWith(
        AuthAction.UPDATE,
        AuthSubject.SUBJECT,
        undefined,
      );
    });

    it("calls subject service", async () => {
      await controller.updateSubject(
        { user: { ability: ability } } as unknown as AppRequest,
        0,
        {} as UpdateSubjectRequest,
      );
      expect(service.updateSubject).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteSubject", () => {
    const ability = createMongoAbility<AppAbility>([
      { action: AuthAction.DELETE_SOFT, subject: AuthSubject.SUBJECT },
    ]);

    it("should throw ForbiddenError when auth fails", () => {
      const ability = createMongoAbility();
      return expect(() =>
        controller.deleteSubject(
          { user: { ability } } as unknown as AppRequest,
          0,
        ),
      ).toThrow(`Cannot execute "DELETE_SOFT" on "SUBJECT"`);
    });

    it("should perform basic auth check", async () => {
      const abilitySpy = jest.spyOn(ability, "relevantRuleFor");
      await controller.deleteSubject(
        { user: { ability } } as unknown as AppRequest,
        0,
      );
      return expect(abilitySpy).toHaveBeenCalledWith(
        AuthAction.DELETE_SOFT,
        AuthSubject.SUBJECT,
        undefined,
      );
    });

    it("calls subject service", async () => {
      await controller.deleteSubject(
        { user: { ability: ability } } as unknown as AppRequest,
        0,
      );
      expect(service.deleteSubject).toHaveBeenCalledTimes(1);
    });
  });

  describe("listSubjects", () => {
    const ability = createMongoAbility<AppAbility>([
      { action: AuthAction.LIST, subject: AuthSubject.SUBJECT },
    ]);

    it("should throw ForbiddenError when auth fails", () => {
      const ability = createMongoAbility();
      return expect(() =>
        controller.listSubjects(
          { user: { ability } } as unknown as AppRequest,
          {},
        ),
      ).toThrow(`Cannot execute "LIST" on "SUBJECT"`);
    });

    it("should perform basic auth check", async () => {
      const abilitySpy = jest.spyOn(ability, "relevantRuleFor");
      await controller.listSubjects(
        { user: { ability } } as unknown as AppRequest,
        {},
      );
      return expect(abilitySpy).toHaveBeenCalledWith(
        AuthAction.LIST,
        AuthSubject.SUBJECT,
        undefined,
      );
    });

    it("calls subject service", async () => {
      await controller.listSubjects(
        { user: { ability: ability } } as unknown as AppRequest,
        {},
      );
      expect(service.getFilteredSubjectList).toHaveBeenCalledTimes(1);
    });
  });
});
