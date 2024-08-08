import { UserEntity } from "@db/entity/user.entity";
import {
  RandomDateInRange,
  RandomIntInRange,
  RandomName,
} from "../../../util/random";
import { DeepPartial } from "typeorm";
import { RoleName } from "@/module/auth/role/types";

export function RandomMockUser(manual?: DeepPartial<UserEntity>): UserEntity {
  const roleTypes = Object.values(RoleName);

  const result = new UserEntity();
  result.id = manual?.id ?? RandomIntInRange(1000, 9999);
  result.name
    = manual?.name
    ?? `${RandomName()}_${RandomName()}_${RandomIntInRange(100, 999)}`;
  result.email = manual?.email ?? `${result.name}@example.com`;
  result.role
    = manual?.role ?? roleTypes[RandomIntInRange(0, roleTypes.length)];
  result.createdById = manual?.createdById ?? RandomIntInRange(1000, 9999);
  result.createdBy = (manual?.createdBy ?? {
    id: result.createdById,
  }) as UserEntity;
  result.modifiedById = manual?.modifiedById ?? RandomIntInRange(1000, 9999);
  result.modifiedBy = (manual?.modifiedBy ?? {
    id: result.modifiedById,
  }) as UserEntity;
  result.createdAt = (manual?.createdAt as Date) ?? RandomDateInRange(-30, 30);
  result.modifiedAt
    = (manual?.modifiedAt as Date)
    ?? RandomDateInRange(1, 30, result.createdAt.getTime());
  return result;

  // const firstName = opt?.firstName ?? RandomName();
  // const lastName = opt?.lastName ?? RandomName();
  // const creatorId = opt?.creatorId ?? RandomIntInRange(1000, 9999);
  // const modifierId = opt?.modifierId ?? RandomIntInRange(1000, 9999);
  // const createDate = opt?.createDate ?? RandomDateInRange(-30, 30);
  // const modifyDate =
  //   opt?.modifyDate ?? RandomDateInRange(createDate.getTime(), 30);

  // return {
  //   id: RandomIntInRange(2, 9999),
  //   email: `${firstName}.${lastName}@example.com`,
  //   name: `TEST_${firstName}_${lastName}`,
  //   createdById: creatorId,
  //   createdBy: { id: creatorId } as UserEntity,
  //   createdAt: createDate,
  //   modifiedById: modifierId,
  //   modifiedBy: { id: modifierId } as UserEntity,
  //   modifiedAt: modifyDate,
  // } as UserEntity;
}

export const mockUsers: { [key: string]: UserEntity } = {
  system: {
    id: 1,
    email: "test@example.com",
    name: "name",
    createdById: 1,
    createdBy: { id: 1 } as UserEntity,
    createdAt: new Date(),
    modifiedById: 1,
    modifiedBy: { id: 1 } as UserEntity,
    modifiedAt: new Date(),
  } as UserEntity,
};
