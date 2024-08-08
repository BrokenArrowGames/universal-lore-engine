import { DeepPartial, EntityManager, QueryBuilder, Repository } from "typeorm";
import { RandomIntInRange } from "./random";

export type EntityGenerator<T> = (arg?: DeepPartial<T>) => T;

export function MockDbUtils<T>(generator: EntityGenerator<T>): {
  repo: jest.MaybeMockedDeep<Repository<T>>;
  qb: jest.MaybeMockedDeep<QueryBuilder<T>>;
} {
  const manager = {
    findOneByOrFail: jest.fn().mockImplementation(() => generator()),
    save: jest.fn(),
    softRemove: jest.fn(),
    transaction: jest.fn(),
    update: jest.fn(),
  };
  manager.transaction.mockImplementation(async (fn) => await fn(manager));

  const qb = {
    select: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockImplementation(() => [generator(), generator()]),
  } as unknown as jest.MaybeMockedDeep<QueryBuilder<T>>;

  const repo = {
    create: jest.fn().mockImplementation((arg) => arg),
    createQueryBuilder: jest.fn().mockReturnValue(qb),
    find: jest.fn().mockImplementation(() => generator()),
    findOneOrFail: jest.fn().mockImplementation(() => generator()),
    findOneByOrFail: jest.fn().mockImplementation(() => generator()),
    save: jest.fn().mockImplementation((arg) => ({
      ...arg,
      id: RandomIntInRange(1000, 9999),
      createdAt: new Date(),
      modifiedAt: new Date(),
    })),
    softRemove: jest.fn(),
    update: jest.fn(),
    manager: manager as unknown as EntityManager,
  } as jest.MaybeMockedDeep<Repository<T>>;
  return { repo, qb };
}
