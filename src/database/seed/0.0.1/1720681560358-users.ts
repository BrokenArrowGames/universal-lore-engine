import { MigrationInterface, QueryRunner } from 'typeorm';

export class Users1720681560358 implements MigrationInterface {
  private ROOT_USER: string = 'system';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app"."user" ALTER COLUMN "created_by" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "app"."user" ALTER COLUMN "modified_by" DROP NOT NULL`,
    );
    await queryRunner.query(
      `INSERT INTO "app"."user" (name, email) VALUES ('${this.ROOT_USER}', '${this.ROOT_USER}@localhost')`,
    );

    const [{ id: defaultUser }] = await queryRunner.query(
      `SELECT id FROM "app"."user" WHERE name = 'system' LIMIT 1`,
    );
    await queryRunner.query(
      `UPDATE "app"."user" SET created_by = '${defaultUser}'`,
    );
    await queryRunner.query(
      `UPDATE "app"."user" SET modified_by = '${defaultUser}'`,
    );

    await queryRunner.query(
      `ALTER TABLE "app"."user" ALTER COLUMN "modified_by" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "app"."user" ALTER COLUMN "created_by" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "app"."user" WHERE "name" = '${this.ROOT_USER}'`,
    );
  }
}
