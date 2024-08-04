import { UserEntity } from '@db/entity/user.entity';
import { RandomDateInRange, RandomIntInRange, RandomName } from './random';
import { DataSource, EntityManager, Repository } from 'typeorm';

export function MockDbRepo<T>(): jest.MaybeMockedDeep<Repository<T>> {
  const manager = {
    findOneByOrFail: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
    transaction: jest.fn(),
    update: jest.fn(),
  };

  manager.transaction.mockImplementation(async (fn) => await fn(manager));

  return {
    find: jest.fn(),
    findOneOrFail: jest.fn(),
    findOneByOrFail: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    manager: manager as unknown as EntityManager,
  } as jest.MaybeMockedDeep<Repository<T>>;
}

export function MockDataSourceFactory(): DataSource {
  return {} as DataSource;
}

export function RandomMockUser(opt?: {
  firstName?: string;
  lastName?: string;
  creatorId?: number;
  modifierId?: number;
  createDate?: Date;
  modifyDate?: Date;
}): UserEntity {
  const firstName = opt?.firstName ?? RandomName();
  const lastName = opt?.lastName ?? RandomName();
  const creatorId = opt?.creatorId ?? RandomIntInRange(2, 9999);
  const modifierId = opt?.modifierId ?? RandomIntInRange(2, 9999);
  const createDate = opt?.createDate ?? RandomDateInRange(-30, 30);
  const modifyDate =
    opt?.modifyDate ?? RandomDateInRange(createDate.getTime(), 30);

  return {
    id: RandomIntInRange(2, 9999),
    email: `${firstName}.${lastName}@example.com`,
    name: `TEST_${firstName}_${lastName}`,
    createdById: creatorId,
    createdBy: { id: creatorId } as UserEntity,
    createdAt: createDate,
    modifiedById: modifierId,
    modifiedBy: { id: modifierId } as UserEntity,
    modifiedAt: modifyDate,
  } as UserEntity;
}

export const mockUsers: { [key: string]: UserEntity } = {
  system: {
    id: 1,
    email: 'test@example.com',
    name: 'name',
    createdById: 1,
    createdBy: { id: 1 } as UserEntity,
    createdAt: new Date(),
    modifiedById: 1,
    modifiedBy: { id: 1 } as UserEntity,
    modifiedAt: new Date(),
  } as UserEntity,
};
