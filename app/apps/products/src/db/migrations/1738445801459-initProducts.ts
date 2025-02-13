import { MigrationInterface, QueryRunner } from "typeorm";

export class InitProducts1738445801459 implements MigrationInterface {
    name = 'InitProducts1738445801459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_products" DROP COLUMN "total_price"`);
        await queryRunner.query(`ALTER TABLE "custom_products" ADD "totalPrice" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "custom_products" DROP COLUMN "placement"`);
        await queryRunner.query(`ALTER TABLE "custom_products" ADD "placement" jsonb NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_products" DROP COLUMN "placement"`);
        await queryRunner.query(`ALTER TABLE "custom_products" ADD "placement" json NOT NULL`);
        await queryRunner.query(`ALTER TABLE "custom_products" DROP COLUMN "totalPrice"`);
        await queryRunner.query(`ALTER TABLE "custom_products" ADD "total_price" numeric(10,2) NOT NULL`);
    }

}
