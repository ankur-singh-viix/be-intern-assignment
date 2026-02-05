import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFollowTable1770312982967 implements MigrationInterface {
    name = 'CreateFollowTable1770312982967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "follows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "followerId" integer, "followingId" integer, CONSTRAINT "UQ_105079775692df1f8799ed0fac8" UNIQUE ("followerId", "followingId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ed35f6b8520ae588c4d39770ff" ON "follows" ("followingId", "createdAt") `);
        await queryRunner.query(`DROP INDEX "IDX_ed35f6b8520ae588c4d39770ff"`);
        await queryRunner.query(`CREATE TABLE "temporary_follows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "followerId" integer, "followingId" integer, CONSTRAINT "UQ_105079775692df1f8799ed0fac8" UNIQUE ("followerId", "followingId"), CONSTRAINT "FK_fdb91868b03a2040db408a53331" FOREIGN KEY ("followerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_ef463dd9a2ce0d673350e36e0fb" FOREIGN KEY ("followingId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_follows"("id", "createdAt", "followerId", "followingId") SELECT "id", "createdAt", "followerId", "followingId" FROM "follows"`);
        await queryRunner.query(`DROP TABLE "follows"`);
        await queryRunner.query(`ALTER TABLE "temporary_follows" RENAME TO "follows"`);
        await queryRunner.query(`CREATE INDEX "IDX_ed35f6b8520ae588c4d39770ff" ON "follows" ("followingId", "createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_ed35f6b8520ae588c4d39770ff"`);
        await queryRunner.query(`ALTER TABLE "follows" RENAME TO "temporary_follows"`);
        await queryRunner.query(`CREATE TABLE "follows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "followerId" integer, "followingId" integer, CONSTRAINT "UQ_105079775692df1f8799ed0fac8" UNIQUE ("followerId", "followingId"))`);
        await queryRunner.query(`INSERT INTO "follows"("id", "createdAt", "followerId", "followingId") SELECT "id", "createdAt", "followerId", "followingId" FROM "temporary_follows"`);
        await queryRunner.query(`DROP TABLE "temporary_follows"`);
        await queryRunner.query(`CREATE INDEX "IDX_ed35f6b8520ae588c4d39770ff" ON "follows" ("followingId", "createdAt") `);
        await queryRunner.query(`DROP INDEX "IDX_ed35f6b8520ae588c4d39770ff"`);
        await queryRunner.query(`DROP TABLE "follows"`);
    }

}
