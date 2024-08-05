import { MigrationInterface, QueryRunner } from "typeorm";

export class SessionStore1722750448820 implements MigrationInterface {
  name = "SessionStore1722750448820";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "app"."session" ("expiredAt" bigint NOT NULL, "id" character varying(255) NOT NULL, "json" text NOT NULL, "destroyedAt" TIMESTAMP, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "app"."session" ("expiredAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "app"."IDX_28c5d1d16da7908c97c9bc2f74"`,
    );
    await queryRunner.query(`DROP TABLE "app"."session"`);
  }
}
