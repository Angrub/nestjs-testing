import { MigrationInterface, QueryRunner } from "typeorm";

export class Tables1689035384433 implements MigrationInterface {
    name = 'Tables1689035384433'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Groups" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_be8543c3ec161e109d124cf9498" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "password" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "public_key" text NOT NULL, "first_name" character varying(255) NOT NULL, "last_name" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" SERIAL NOT NULL, "filename" character varying(255) NOT NULL, "originalname" character varying(255) NOT NULL, "digital_signature" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group_users" ("group_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_36620c8747186b00c458893c594" PRIMARY KEY ("group_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_be6db0d7dabab05d97233d19f6" ON "group_users" ("group_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_eba8af4e65056abb4c5f62556c" ON "group_users" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "group_documents" ("group_id" integer NOT NULL, "document_id" integer NOT NULL, CONSTRAINT "PK_70da60d40385249c8d96405e17f" PRIMARY KEY ("group_id", "document_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_005b51abb5f87557fee0d6b737" ON "group_documents" ("group_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2fa3acd7fdbf79c23d16d0f129" ON "group_documents" ("document_id") `);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_c7481daf5059307842edef74d73" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_users" ADD CONSTRAINT "FK_be6db0d7dabab05d97233d19f61" FOREIGN KEY ("group_id") REFERENCES "Groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "group_users" ADD CONSTRAINT "FK_eba8af4e65056abb4c5f62556c6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_documents" ADD CONSTRAINT "FK_005b51abb5f87557fee0d6b737a" FOREIGN KEY ("group_id") REFERENCES "Groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "group_documents" ADD CONSTRAINT "FK_2fa3acd7fdbf79c23d16d0f1293" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_documents" DROP CONSTRAINT "FK_2fa3acd7fdbf79c23d16d0f1293"`);
        await queryRunner.query(`ALTER TABLE "group_documents" DROP CONSTRAINT "FK_005b51abb5f87557fee0d6b737a"`);
        await queryRunner.query(`ALTER TABLE "group_users" DROP CONSTRAINT "FK_eba8af4e65056abb4c5f62556c6"`);
        await queryRunner.query(`ALTER TABLE "group_users" DROP CONSTRAINT "FK_be6db0d7dabab05d97233d19f61"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_c7481daf5059307842edef74d73"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2fa3acd7fdbf79c23d16d0f129"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_005b51abb5f87557fee0d6b737"`);
        await queryRunner.query(`DROP TABLE "group_documents"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_eba8af4e65056abb4c5f62556c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_be6db0d7dabab05d97233d19f6"`);
        await queryRunner.query(`DROP TABLE "group_users"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "Groups"`);
    }

}
