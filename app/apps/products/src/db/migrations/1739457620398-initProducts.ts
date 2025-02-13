import { MigrationInterface, QueryRunner } from "typeorm";

export class InitProducts1739457620398 implements MigrationInterface {
    name = 'InitProducts1739457620398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_stores" ADD "storePic" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "user_stores" ADD "storeBanner" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "user_stores" ADD CONSTRAINT "UQ_c1ae840a5dd1c3b47e9e0295e71" UNIQUE ("userId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_stores" DROP CONSTRAINT "UQ_c1ae840a5dd1c3b47e9e0295e71"`);
        await queryRunner.query(`ALTER TABLE "user_stores" DROP COLUMN "storeBanner"`);
        await queryRunner.query(`ALTER TABLE "user_stores" DROP COLUMN "storePic"`);
    }

}
