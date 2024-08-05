import { In, MigrationInterface, QueryRunner } from "typeorm";
import { UserEntity } from "../../../src/database/entity/user.entity";
import { Config, LoadConfig } from "@util/config";
import { RoleName } from "@/module/auth/role/types";

export class Users1722728782521 implements MigrationInterface {
  private config: Config = LoadConfig();
  private users: string[] = [
    "tst_admin",
    "tst_user",
    "tst_user1",
    "tst_user2",
    "tst_author",
    "tst_reader",
    "tst_reader1",
    "tst_reader2",
    "tst_dm",
    "tst_player",
    "tst_player1",
    "tst_player2",
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    const SYS_USER = this.config.app.sysUser;
    const { id: sysUser } = await queryRunner.manager.findOneByOrFail(
      UserEntity,
      { name: SYS_USER },
    );

    const users = this.users.map((name) =>
      queryRunner.manager.create(UserEntity, {
        name,
        role: name.includes("admin") ? RoleName.ADMIN : RoleName.USER,
        email: `${name}@localhost`,
        createdBy: { id: sysUser },
        modifiedBy: { id: sysUser },
      }),
    );
    await queryRunner.manager.insert(UserEntity, users);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const toRemove = await queryRunner.manager.findBy(UserEntity, {
      name: In(this.users),
    });
    queryRunner.manager.softRemove(UserEntity, toRemove);
  }
}
