import { MigrationInterface, QueryRunner } from "typeorm";

export class InitUsers1735398377929 implements MigrationInterface {
    name = 'InitUsers1735398377929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "profilePic" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "phoneNumber" character varying, "address" character varying, CONSTRAINT "UQ_8bf09ba754322ab9c22a215c919" UNIQUE ("userId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
