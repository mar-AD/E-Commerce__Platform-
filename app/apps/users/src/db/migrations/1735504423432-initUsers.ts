import { MigrationInterface, QueryRunner } from "typeorm";

export class InitUsers1735504423432 implements MigrationInterface {
    name = 'InitUsers1735504423432'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "profilePic" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "profilePic" SET NOT NULL`);
    }

}
