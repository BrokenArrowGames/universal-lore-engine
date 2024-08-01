import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialTables1722492337301 implements MigrationInterface {
    name = 'InitialTables1722492337301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "app"."user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "name" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'USER', "created_by" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "modified_by" integer NOT NULL, "modified_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_065d4d8f3b5adb4a08841eae3c8" UNIQUE ("name"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "app"."subject_tag" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "modified_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer NOT NULL, "modified_by" integer NOT NULL, CONSTRAINT "UQ_518505346360205ee36bc8eb90a" UNIQUE ("name"), CONSTRAINT "PK_d1b2388551fca7619b5699590dc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "app"."subject" ("id" SERIAL NOT NULL, "private" boolean NOT NULL DEFAULT true, "key" character varying NOT NULL, "display_name" character varying NOT NULL, "short_description" character varying, "long_description" character varying NOT NULL, "note" character varying, "type" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "modified_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer NOT NULL, "modified_by" integer NOT NULL, CONSTRAINT "UQ_68a466f25c52b0aabc72d836eee" UNIQUE ("key"), CONSTRAINT "PK_12eee115462e38d62e5455fc054" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "app"."subject_tag_mapping" ("subject_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "PK_c8041c2aeb41ae0262f83654aa9" PRIMARY KEY ("subject_id", "tag_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a32d0ae4113496e1370cbbb0a1" ON "app"."subject_tag_mapping" ("subject_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b6f1a1a39248732a7e82667cd0" ON "app"."subject_tag_mapping" ("tag_id") `);
        await queryRunner.query(`ALTER TABLE "app"."user" ADD CONSTRAINT "FK_d2f5e343630bd8b7e1e7534e82e" FOREIGN KEY ("created_by") REFERENCES "app"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app"."user" ADD CONSTRAINT "FK_60919e8ebef42a386bfc3940861" FOREIGN KEY ("modified_by") REFERENCES "app"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app"."subject_tag" ADD CONSTRAINT "FK_d75f7c32fd76b131f89a03bda9f" FOREIGN KEY ("created_by") REFERENCES "app"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app"."subject_tag" ADD CONSTRAINT "FK_ba47d3f448913d3d38f8f58c6c6" FOREIGN KEY ("modified_by") REFERENCES "app"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app"."subject" ADD CONSTRAINT "FK_a86353dbe2259c6f0e185c8899d" FOREIGN KEY ("created_by") REFERENCES "app"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app"."subject" ADD CONSTRAINT "FK_adc492b85d46ea81589b925ce25" FOREIGN KEY ("modified_by") REFERENCES "app"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app"."subject_tag_mapping" ADD CONSTRAINT "FK_a32d0ae4113496e1370cbbb0a16" FOREIGN KEY ("subject_id") REFERENCES "app"."subject"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "app"."subject_tag_mapping" ADD CONSTRAINT "FK_b6f1a1a39248732a7e82667cd07" FOREIGN KEY ("tag_id") REFERENCES "app"."subject_tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app"."subject_tag_mapping" DROP CONSTRAINT "FK_b6f1a1a39248732a7e82667cd07"`);
        await queryRunner.query(`ALTER TABLE "app"."subject_tag_mapping" DROP CONSTRAINT "FK_a32d0ae4113496e1370cbbb0a16"`);
        await queryRunner.query(`ALTER TABLE "app"."subject" DROP CONSTRAINT "FK_adc492b85d46ea81589b925ce25"`);
        await queryRunner.query(`ALTER TABLE "app"."subject" DROP CONSTRAINT "FK_a86353dbe2259c6f0e185c8899d"`);
        await queryRunner.query(`ALTER TABLE "app"."subject_tag" DROP CONSTRAINT "FK_ba47d3f448913d3d38f8f58c6c6"`);
        await queryRunner.query(`ALTER TABLE "app"."subject_tag" DROP CONSTRAINT "FK_d75f7c32fd76b131f89a03bda9f"`);
        await queryRunner.query(`ALTER TABLE "app"."user" DROP CONSTRAINT "FK_60919e8ebef42a386bfc3940861"`);
        await queryRunner.query(`ALTER TABLE "app"."user" DROP CONSTRAINT "FK_d2f5e343630bd8b7e1e7534e82e"`);
        await queryRunner.query(`DROP INDEX "app"."IDX_b6f1a1a39248732a7e82667cd0"`);
        await queryRunner.query(`DROP INDEX "app"."IDX_a32d0ae4113496e1370cbbb0a1"`);
        await queryRunner.query(`DROP TABLE "app"."subject_tag_mapping"`);
        await queryRunner.query(`DROP TABLE "app"."subject"`);
        await queryRunner.query(`DROP TABLE "app"."subject_tag"`);
        await queryRunner.query(`DROP TABLE "app"."user"`);
    }

}
