import { UserEntity } from "@db/entity/user.entity";
import { RandomDateInRange, RandomIntInRange, RandomName } from "./random";

export function RandomMockUser(opt?: {
  firstName?: string,
  lastName?: string,
  creatorId?: number,
  modifierId?: number,
  createDate?: Date,
  modifyDate?: Date,
}): UserEntity {
  const firstName  = opt?.firstName  ?? RandomName();
  const lastName   = opt?.lastName   ?? RandomName();
  const creatorId  = opt?.creatorId  ?? RandomIntInRange(2, 9999);
  const modifierId = opt?.modifierId ?? RandomIntInRange(2, 9999);
  const createDate = opt?.createDate ?? RandomDateInRange(-30, 30);
  const modifyDate = opt?.modifyDate ?? RandomDateInRange(createDate.getTime(), 30);

  return {
    id: RandomIntInRange(2, 9999),
    email: `${firstName}.${lastName}@example.com`,
    name: `TEST_${firstName}_${lastName}`,
    created_by_id: creatorId,
    created_by: { id: creatorId } as UserEntity,
    created_at: createDate,
    modified_by_id: modifierId,
    modified_by: { id: modifierId } as UserEntity,
    modified_at: modifyDate,
  } as UserEntity;
}

export const mockUsers: { [key:string]: UserEntity } = {
  system: {
    id: 1,
    email: "test@example.com",
    name: "name",
    created_by_id: 1,
    created_by: { id: 1 } as UserEntity,
    created_at: new Date(),
    modified_by_id: 1,
    modified_by: { id: 1 } as UserEntity,
    modified_at: new Date(),
  } as UserEntity
};