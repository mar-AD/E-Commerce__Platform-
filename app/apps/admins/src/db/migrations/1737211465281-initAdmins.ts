import { MigrationInterface, QueryRunner } from "typeorm";

export class InitAdmins1737211465281 implements MigrationInterface {
    name = 'InitAdmins1737211465281'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "adminId" character varying NOT NULL, "profilePic" character varying, "fullName" character varying, CONSTRAINT "UQ_ef59d3e41a13a4471afd8168c36" UNIQUE ("adminId"), CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "admins"`);
    }

}
