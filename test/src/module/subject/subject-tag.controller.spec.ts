import { TestBed } from "@automock/jest";
import { SubjectTagController } from "@mod/subject/subject-tag.controller";
import { SubjectTagService } from "@mod/subject/subject-tag.service";

describe("SubjectTagController", () => {
  let controller: SubjectTagController;
  let _service: SubjectTagService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(SubjectTagController).compile();

    controller = unit;
    _service = unitRef.get(SubjectTagService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
