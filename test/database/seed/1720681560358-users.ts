import { In, MigrationInterface, QueryRunner } from 'typeorm';
import { UserEntity } from '../../../src/database/entity/user.entity';

export class Users1720681560358 implements MigrationInterface {
  private users: string[] = [
    'tst_admin',
    'tst_user1',
    'tst_user2',
    'tst_author',
    'tst_reader1',
    'tst_reader2',
    'tst_dm',
    'tst_player1',
    'tst_player2',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.manager.getRepository(UserEntity);
    const { id: defaultUser } = await repo.findOneByOrFail({ name: 'system' });

    const users = this.users.map((name) =>
      repo.create({
        name,
        email: `${name}@localhost`,
        created_by: { id: defaultUser },
        modified_by: { id: defaultUser },
      }),
    );
    await repo.insert(users);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.manager.getRepository(UserEntity);
    repo.delete({ name: In(this.users) });
  }
}
