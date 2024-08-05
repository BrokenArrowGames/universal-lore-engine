import { MigrationInterface, QueryRunner } from "typeorm";

export class AppSchema1721598351486 implements MigrationInterface {
  name = "AppSchema1721598351486";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createSchema(`app`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropSchema(`app`);
  }
}
