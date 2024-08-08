import { SubjectEntity, SubjectType } from "@/database/entity/subject.entity";
import {
  RandomDateInRange,
  RandomIntInRange,
  RandomName,
} from "../../../util/random";
import { DeepPartial } from "typeorm";
import { RandomMockUser } from "../user/mock-user";
import { UserEntity } from "@/database/entity/user.entity";
import { SubjectTagEntity } from "@/database/entity/subject-tag.entity";

export function RandomMockSubject(
  manual?: DeepPartial<SubjectEntity>,
): SubjectEntity {
  const subjectTypes = Object.values(SubjectType);

  const result: SubjectEntity = new SubjectEntity();
  result.id = manual?.id ?? RandomIntInRange(1000, 9999);
  result.private = manual?.private ?? false;
  result.key = manual?.key ?? RandomName();
  result.display_name = manual?.display_name ?? RandomName();
  result.short_description
    = manual?.short_description ?? `${result.display_name} - dummy description`;
  result.long_description
    = manual?.long_description
    ?? `${result.display_name} - dummy long description`;
  result.note = manual?.note ?? `${result.display_name} - dummy note`;
  result.type
    = manual?.type ?? subjectTypes[RandomIntInRange(0, subjectTypes.length)];
  result.tags = (manual?.tags as SubjectTagEntity[]) ?? [];
  result.createdBy = (manual?.createdBy as UserEntity) ?? RandomMockUser();
  result.modifiedBy = (manual?.modifiedBy as UserEntity) ?? RandomMockUser();
  result.createdAt = (manual?.createdAt as Date) ?? RandomDateInRange(-30, 30);
  result.modifiedAt
    = (manual?.modifiedAt as Date)
    ?? RandomDateInRange(1, 30, result.createdAt.getTime());
  return result;
}

export const mockSubject: Record<string, SubjectEntity> = {
  listResult: {
    id: 1,
    private: false,
    key: "plain",
    display_name: "plain",
    short_description: "longer desc",
    type: SubjectType.THING,
    tags: [],
  } as SubjectEntity,

  minimal: {
    id: 2,
    private: false,
    key: "plain",
    display_name: "plain",
    long_description: "longer desc",
    type: SubjectType.THING,
    tags: [],
    createdBy: { id: 1 } as UserEntity,
    modifiedBy: { id: 1 } as UserEntity,
    createdAt: new Date(),
    modifiedAt: new Date(),
  } as SubjectEntity,

  full: {
    id: 3,
    private: false,
    key: "plain",
    display_name: "plain",
    short_description: "short desc",
    long_description: "longer desc",
    note: "note",
    type: SubjectType.THING,
    tags: [{ id: 1, name: "test" }],
    createdBy: { id: 1 } as UserEntity,
    modifiedBy: { id: 1 } as UserEntity,
    createdAt: new Date(),
    modifiedAt: new Date(),
  } as SubjectEntity,
};
