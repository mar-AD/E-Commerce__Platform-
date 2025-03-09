import { MigrationInterface, QueryRunner } from "typeorm";

export class InitOrders1741536845105 implements MigrationInterface {
    name = 'InitOrders1741536845105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders_entity" ALTER COLUMN "deliveryDate" SET DEFAULT '"2025-03-14T16:14:19.792Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders_entity" ALTER COLUMN "deliveryDate" SET DEFAULT '2025-03-14 15:40:05.351'`);
    }

}
