import { AppAbility } from "@/module/auth/util/ability";
import { AppRequest } from "@/util/app-request";
import { TestBed } from "@automock/jest";
import { createMongoAbility } from "@casl/ability";
import { SubjectTagController } from "@mod/subject/subject-tag.controller";
import { SubjectTagService } from "@mod/subject/subject-tag.service";

describe("SubjectTagController", () => {
  let controller: SubjectTagController;
  let service: SubjectTagService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(SubjectTagController).compile();

    controller = unit;
    service = unitRef.get(SubjectTagService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("listSubjectTags", () => {
    it("should not perform auth check", async () => {
      const ability = createMongoAbility<AppAbility>();
      const abilitySpy = jest.spyOn(ability, "relevantRuleFor");
      await controller.listSubjectTags(
        { user: { ability } } as unknown as AppRequest,
        {},
      );
      return expect(abilitySpy).toHaveBeenCalledTimes(0);
    });

    it("calls subjectTag service", async () => {
      const ability = createMongoAbility<AppAbility>();
      await controller.listSubjectTags(
        { user: { ability } } as unknown as AppRequest,
        {},
      );
      expect(service.getFilteredSubjectTagList).toHaveBeenCalledTimes(1);
    });
  });
});
