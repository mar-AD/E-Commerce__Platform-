import { MigrationInterface, QueryRunner } from "typeorm";

export class InitProducts1738067687482 implements MigrationInterface {
    name = 'InitProducts1738067687482'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "image" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "template"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "template" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "template"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "template" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "image" character varying NOT NULL`);
    }

}
