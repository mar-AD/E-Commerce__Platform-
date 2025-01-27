import { MigrationInterface, QueryRunner } from "typeorm";

export class InitProducts1738000243686 implements MigrationInterface {
    name = 'InitProducts1738000243686'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "image" character varying NOT NULL, "template" character varying NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4c9fb58de893725258746385e16" UNIQUE ("name"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "custom_products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "design" character varying NOT NULL, "placement" json NOT NULL, "color" character varying NOT NULL, "size" character varying NOT NULL, "total_price" numeric(10,2) NOT NULL, "isPublished" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "product_id" uuid NOT NULL, CONSTRAINT "PK_eed912c2e523ece86f15428bb5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_stores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "storeName" character varying(255) NOT NULL, "storeDescription" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b8f8a8e066cd32b77e78e8f7bfd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "custom_products" ADD CONSTRAINT "FK_edfbbf9b4bdb4be06bcc7ec5dc9" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_products" DROP CONSTRAINT "FK_edfbbf9b4bdb4be06bcc7ec5dc9"`);
        await queryRunner.query(`DROP TABLE "user_stores"`);
        await queryRunner.query(`DROP TABLE "custom_products"`);
        await queryRunner.query(`DROP TABLE "products"`);
    }

}
