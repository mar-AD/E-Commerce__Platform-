import { MigrationInterface, QueryRunner } from "typeorm";

export class InitOrders1741534795307 implements MigrationInterface {
    name = 'InitOrders1741534795307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders_entity" DROP COLUMN "totalPrice"`);
        await queryRunner.query(`ALTER TABLE "orders_entity" ADD "totalPrice" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders_entity" ALTER COLUMN "deliveryDate" SET DEFAULT '"2025-03-14T15:40:05.351Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders_entity" ALTER COLUMN "deliveryDate" SET DEFAULT '2025-03-14 14:57:38.908'`);
        await queryRunner.query(`ALTER TABLE "orders_entity" DROP COLUMN "totalPrice"`);
        await queryRunner.query(`ALTER TABLE "orders_entity" ADD "totalPrice" integer NOT NULL`);
    }

}
