import { MigrationInterface, QueryRunner } from "typeorm";

export class InitAuth1727369225539 implements MigrationInterface {
    name = 'InitAuth1727369225539'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin" ADD "isDeleted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "refreshToken" ADD "revoked" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refreshToken" DROP COLUMN "revoked"`);
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "isDeleted"`);
    }

}
