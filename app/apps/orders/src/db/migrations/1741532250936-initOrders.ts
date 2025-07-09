import { MigrationInterface, QueryRunner } from "typeorm";

export class InitOrders1741532250936 implements MigrationInterface {
    name = 'InitOrders1741532250936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."orders_entity_status_enum" AS ENUM('0', '1', '2', '3', '-1')`);
        await queryRunner.query(`CREATE TABLE "orders_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "products" jsonb NOT NULL, "totalPrice" integer NOT NULL, "deliveryDate" TIMESTAMP NOT NULL DEFAULT '"2025-03-14T14:57:38.908Z"', "status" "public"."orders_entity_status_enum" NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a5532d4752516bb661d3c7e928" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "orders_entity"`);
        await queryRunner.query(`DROP TYPE "public"."orders_entity_status_enum"`);
    }

}
