import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLikeTable1770315602393 implements MigrationInterface {
    name = 'CreateLikeTable1770315602393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "likes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "postId" integer, CONSTRAINT "UQ_74b9b8cd79a1014e50135f266fe" UNIQUE ("userId", "postId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e2fe567ad8d305fefc918d44f5" ON "likes" ("postId") `);
        await queryRunner.query(`DROP INDEX "IDX_e2fe567ad8d305fefc918d44f5"`);
        await queryRunner.query(`CREATE TABLE "temporary_likes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "postId" integer, CONSTRAINT "UQ_74b9b8cd79a1014e50135f266fe" UNIQUE ("userId", "postId"), CONSTRAINT "FK_cfd8e81fac09d7339a32e57d904" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_e2fe567ad8d305fefc918d44f50" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_likes"("id", "createdAt", "userId", "postId") SELECT "id", "createdAt", "userId", "postId" FROM "likes"`);
        await queryRunner.query(`DROP TABLE "likes"`);
        await queryRunner.query(`ALTER TABLE "temporary_likes" RENAME TO "likes"`);
        await queryRunner.query(`CREATE INDEX "IDX_e2fe567ad8d305fefc918d44f5" ON "likes" ("postId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_e2fe567ad8d305fefc918d44f5"`);
        await queryRunner.query(`ALTER TABLE "likes" RENAME TO "temporary_likes"`);
        await queryRunner.query(`CREATE TABLE "likes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "postId" integer, CONSTRAINT "UQ_74b9b8cd79a1014e50135f266fe" UNIQUE ("userId", "postId"))`);
        await queryRunner.query(`INSERT INTO "likes"("id", "createdAt", "userId", "postId") SELECT "id", "createdAt", "userId", "postId" FROM "temporary_likes"`);
        await queryRunner.query(`DROP TABLE "temporary_likes"`);
        await queryRunner.query(`CREATE INDEX "IDX_e2fe567ad8d305fefc918d44f5" ON "likes" ("postId") `);
        await queryRunner.query(`DROP INDEX "IDX_e2fe567ad8d305fefc918d44f5"`);
        await queryRunner.query(`DROP TABLE "likes"`);
    }

}
