import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1724209878012 implements MigrationInterface {
    name = 'Initial1724209878012'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP, "deletedAt" TIMESTAMP, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "slug" character varying NOT NULL, "password" character varying NOT NULL, "roles" text array NOT NULL, "phone" character varying, "profileImage" character varying, "signupIp" character varying NOT NULL, "signupAnalyticsSessionId" character varying NOT NULL, "signupUtmSource" character varying, "signupProvider" character varying NOT NULL, "lastVisitAt" TIMESTAMP, "sessionCount" integer NOT NULL DEFAULT '1', "experimentActiveVariants" json NOT NULL DEFAULT '{}', "shouldRefreshRoles" boolean NOT NULL DEFAULT false, "isAdmin" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bc0c27d77ee64f0a097a5c269b" ON "users" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_204e9b624861ff4a5b26819210" ON "users" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE TABLE "posts" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "content" text, "published" boolean NOT NULL DEFAULT false, "authorId" integer, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_204e9b624861ff4a5b26819210"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc0c27d77ee64f0a097a5c269b"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
