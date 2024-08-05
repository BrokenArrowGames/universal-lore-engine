import { TestBed } from "@automock/jest";
import { createMongoAbility, ForbiddenError } from "@casl/ability";
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
  let _service: SubjectService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(SubjectController).compile();

    controller = unit;
    _service = unitRef.get(SubjectService);
  });

  it("should be defined", () => {
    return expect(controller).toBeDefined();
  });

  describe("createSubject", () => {
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
      const errorSpy = jest.spyOn(ForbiddenError, "from");
      const ability = createMongoAbility<AppAbility>([
        { action: AuthAction.CREATE, subject: AuthSubject.SUBJECT },
      ]);
      await controller.createSubject(
        { user: { ability } } as unknown as AppRequest,
        {} as CreateSubjectRequest,
      );
      return expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe("readSubject", () => {
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
      const errorSpy = jest.spyOn(ForbiddenError, "from");
      const ability = createMongoAbility<AppAbility>([
        { action: AuthAction.READ, subject: AuthSubject.SUBJECT },
      ]);
      await controller.readSubject(
        { user: { ability } } as unknown as AppRequest,
        0,
      );
      return expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe("updateSubject", () => {
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
      const errorSpy = jest.spyOn(ForbiddenError, "from");
      const ability = createMongoAbility<AppAbility>([
        { action: AuthAction.UPDATE, subject: AuthSubject.SUBJECT },
      ]);
      await controller.updateSubject(
        { user: { ability } } as unknown as AppRequest,
        0,
        {} as UpdateSubjectRequest,
      );
      return expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe("deleteSubject", () => {
    it("should throw ForbiddenError when auth fails", () => {
      const ability = createMongoAbility();
      return expect(() =>
        controller.deleteSubject(
          { user: { ability } } as unknown as AppRequest,
          0,
        ),
      ).toThrow(`Cannot execute "DELETE" on "SUBJECT"`);
    });

    it("should perform basic auth check", async () => {
      const errorSpy = jest.spyOn(ForbiddenError, "from");
      const ability = createMongoAbility<AppAbility>([
        { action: AuthAction.DELETE, subject: AuthSubject.SUBJECT },
      ]);
      await controller.deleteSubject(
        { user: { ability } } as unknown as AppRequest,
        0,
      );
      return expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe("listSubjects", () => {
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
      const errorSpy = jest.spyOn(ForbiddenError, "from");
      const ability = createMongoAbility<AppAbility>([
        { action: AuthAction.LIST, subject: AuthSubject.SUBJECT },
      ]);
      await controller.listSubjects(
        { user: { ability } } as unknown as AppRequest,
        {},
      );
      return expect(errorSpy).toHaveBeenCalled();
    });
  });
});
