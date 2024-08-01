import { In, MigrationInterface, QueryRunner } from 'typeorm';
import { UserEntity } from '../../../src/database/entity/user.entity';
import { Config, LoadConfig } from '@util/config';
import { RoleName } from '@mod/auth/role/types';

export class Auth1722373547830 implements MigrationInterface {
  private users: string[] = [
    'tst_admin',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const user of this.users) {
      const entity = await queryRunner.manager.findOneByOrFail(UserEntity, { name: user });
      queryRunner.manager.update(UserEntity, entity.id, { role: RoleName.ADMIN });
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
