import { Config, LoadConfig } from "@/util/config";
import { MigrationInterface, QueryRunner } from "typeorm";

export class SystemUser1722728782520 implements MigrationInterface {
  name = "InitialTables1722728782520";
  config: Config = LoadConfig();

  public async createSystemUser(queryRunner: QueryRunner, sysUserName: string) {
    if (!sysUserName) {
      throw Error("missing system user name");
    }
    await queryRunner.query(
      `INSERT INTO "app"."user" (name, email, role) VALUES ('${sysUserName}', '${sysUserName}@localhost', 'ADMIN')`,
    );
    const [{ id: sysUserId }] = await queryRunner.query(
      `SELECT id FROM "app"."user" WHERE name = '${sysUserName}' LIMIT 1`,
    );
    await queryRunner.query(
      `UPDATE "app"."user" SET created_by = '${sysUserId}'`,
    );
    await queryRunner.query(
      `UPDATE "app"."user" SET modified_by = '${sysUserId}'`,
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app"."user" ALTER COLUMN "modified_by" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "app"."user" ALTER COLUMN "created_by" DROP NOT NULL`,
    );
    await this.createSystemUser(queryRunner, this.config.app.sysUser);
    await queryRunner.query(
      `ALTER TABLE "app"."user" ALTER COLUMN "modified_by" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "app"."user" ALTER COLUMN "created_by" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "app"."subject"`);
    await queryRunner.query(`DELETE FROM "app"."subject_tag"`);
    await queryRunner.query(`DELETE FROM "app"."user"`);
  }
}
