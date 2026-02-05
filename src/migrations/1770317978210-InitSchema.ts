import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1770317978210 implements MigrationInterface {
    name = 'InitSchema1770317978210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "hashtags" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(100) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_7fedde18872deb14e4889361d7b" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7fedde18872deb14e4889361d7" ON "hashtags" ("name") `);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "authorId" integer)`);
        await queryRunner.query(`CREATE INDEX "IDX_65d5fbf616c25e628a12898e68" ON "posts" ("authorId", "createdAt") `);
        await queryRunner.query(`CREATE TABLE "follows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "followerId" integer, "followingId" integer, CONSTRAINT "UQ_105079775692df1f8799ed0fac8" UNIQUE ("followerId", "followingId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ed35f6b8520ae588c4d39770ff" ON "follows" ("followingId", "createdAt") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar(255) NOT NULL, "lastName" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "likes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "postId" integer, CONSTRAINT "UQ_74b9b8cd79a1014e50135f266fe" UNIQUE ("userId", "postId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e2fe567ad8d305fefc918d44f5" ON "likes" ("postId") `);
        await queryRunner.query(`CREATE TABLE "post_hashtags" ("postId" integer NOT NULL, "hashtagId" integer NOT NULL, PRIMARY KEY ("postId", "hashtagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_003e77538237089ff217a1cfe7" ON "post_hashtags" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_31c935be539e76295a7f1c632a" ON "post_hashtags" ("hashtagId") `);
        await queryRunner.query(`DROP INDEX "IDX_65d5fbf616c25e628a12898e68"`);
        await queryRunner.query(`CREATE TABLE "temporary_posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "authorId" integer, CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_posts"("id", "content", "createdAt", "updatedAt", "authorId") SELECT "id", "content", "createdAt", "updatedAt", "authorId" FROM "posts"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
        await queryRunner.query(`CREATE INDEX "IDX_65d5fbf616c25e628a12898e68" ON "posts" ("authorId", "createdAt") `);
        await queryRunner.query(`DROP INDEX "IDX_ed35f6b8520ae588c4d39770ff"`);
        await queryRunner.query(`CREATE TABLE "temporary_follows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "followerId" integer, "followingId" integer, CONSTRAINT "UQ_105079775692df1f8799ed0fac8" UNIQUE ("followerId", "followingId"), CONSTRAINT "FK_fdb91868b03a2040db408a53331" FOREIGN KEY ("followerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_ef463dd9a2ce0d673350e36e0fb" FOREIGN KEY ("followingId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_follows"("id", "createdAt", "followerId", "followingId") SELECT "id", "createdAt", "followerId", "followingId" FROM "follows"`);
        await queryRunner.query(`DROP TABLE "follows"`);
        await queryRunner.query(`ALTER TABLE "temporary_follows" RENAME TO "follows"`);
        await queryRunner.query(`CREATE INDEX "IDX_ed35f6b8520ae588c4d39770ff" ON "follows" ("followingId", "createdAt") `);
        await queryRunner.query(`DROP INDEX "IDX_e2fe567ad8d305fefc918d44f5"`);
        await queryRunner.query(`CREATE TABLE "temporary_likes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "postId" integer, CONSTRAINT "UQ_74b9b8cd79a1014e50135f266fe" UNIQUE ("userId", "postId"), CONSTRAINT "FK_cfd8e81fac09d7339a32e57d904" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_e2fe567ad8d305fefc918d44f50" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_likes"("id", "createdAt", "userId", "postId") SELECT "id", "createdAt", "userId", "postId" FROM "likes"`);
        await queryRunner.query(`DROP TABLE "likes"`);
        await queryRunner.query(`ALTER TABLE "temporary_likes" RENAME TO "likes"`);
        await queryRunner.query(`CREATE INDEX "IDX_e2fe567ad8d305fefc918d44f5" ON "likes" ("postId") `);
        await queryRunner.query(`DROP INDEX "IDX_003e77538237089ff217a1cfe7"`);
        await queryRunner.query(`DROP INDEX "IDX_31c935be539e76295a7f1c632a"`);
        await queryRunner.query(`CREATE TABLE "temporary_post_hashtags" ("postId" integer NOT NULL, "hashtagId" integer NOT NULL, CONSTRAINT "FK_003e77538237089ff217a1cfe74" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_31c935be539e76295a7f1c632aa" FOREIGN KEY ("hashtagId") REFERENCES "hashtags" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("postId", "hashtagId"))`);
        await queryRunner.query(`INSERT INTO "temporary_post_hashtags"("postId", "hashtagId") SELECT "postId", "hashtagId" FROM "post_hashtags"`);
        await queryRunner.query(`DROP TABLE "post_hashtags"`);
        await queryRunner.query(`ALTER TABLE "temporary_post_hashtags" RENAME TO "post_hashtags"`);
        await queryRunner.query(`CREATE INDEX "IDX_003e77538237089ff217a1cfe7" ON "post_hashtags" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_31c935be539e76295a7f1c632a" ON "post_hashtags" ("hashtagId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_31c935be539e76295a7f1c632a"`);
        await queryRunner.query(`DROP INDEX "IDX_003e77538237089ff217a1cfe7"`);
        await queryRunner.query(`ALTER TABLE "post_hashtags" RENAME TO "temporary_post_hashtags"`);
        await queryRunner.query(`CREATE TABLE "post_hashtags" ("postId" integer NOT NULL, "hashtagId" integer NOT NULL, PRIMARY KEY ("postId", "hashtagId"))`);
        await queryRunner.query(`INSERT INTO "post_hashtags"("postId", "hashtagId") SELECT "postId", "hashtagId" FROM "temporary_post_hashtags"`);
        await queryRunner.query(`DROP TABLE "temporary_post_hashtags"`);
        await queryRunner.query(`CREATE INDEX "IDX_31c935be539e76295a7f1c632a" ON "post_hashtags" ("hashtagId") `);
        await queryRunner.query(`CREATE INDEX "IDX_003e77538237089ff217a1cfe7" ON "post_hashtags" ("postId") `);
        await queryRunner.query(`DROP INDEX "IDX_e2fe567ad8d305fefc918d44f5"`);
        await queryRunner.query(`ALTER TABLE "likes" RENAME TO "temporary_likes"`);
        await queryRunner.query(`CREATE TABLE "likes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "postId" integer, CONSTRAINT "UQ_74b9b8cd79a1014e50135f266fe" UNIQUE ("userId", "postId"))`);
        await queryRunner.query(`INSERT INTO "likes"("id", "createdAt", "userId", "postId") SELECT "id", "createdAt", "userId", "postId" FROM "temporary_likes"`);
        await queryRunner.query(`DROP TABLE "temporary_likes"`);
        await queryRunner.query(`CREATE INDEX "IDX_e2fe567ad8d305fefc918d44f5" ON "likes" ("postId") `);
        await queryRunner.query(`DROP INDEX "IDX_ed35f6b8520ae588c4d39770ff"`);
        await queryRunner.query(`ALTER TABLE "follows" RENAME TO "temporary_follows"`);
        await queryRunner.query(`CREATE TABLE "follows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "followerId" integer, "followingId" integer, CONSTRAINT "UQ_105079775692df1f8799ed0fac8" UNIQUE ("followerId", "followingId"))`);
        await queryRunner.query(`INSERT INTO "follows"("id", "createdAt", "followerId", "followingId") SELECT "id", "createdAt", "followerId", "followingId" FROM "temporary_follows"`);
        await queryRunner.query(`DROP TABLE "temporary_follows"`);
        await queryRunner.query(`CREATE INDEX "IDX_ed35f6b8520ae588c4d39770ff" ON "follows" ("followingId", "createdAt") `);
        await queryRunner.query(`DROP INDEX "IDX_65d5fbf616c25e628a12898e68"`);
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "authorId" integer)`);
        await queryRunner.query(`INSERT INTO "posts"("id", "content", "createdAt", "updatedAt", "authorId") SELECT "id", "content", "createdAt", "updatedAt", "authorId" FROM "temporary_posts"`);
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
        await queryRunner.query(`CREATE INDEX "IDX_65d5fbf616c25e628a12898e68" ON "posts" ("authorId", "createdAt") `);
        await queryRunner.query(`DROP INDEX "IDX_31c935be539e76295a7f1c632a"`);
        await queryRunner.query(`DROP INDEX "IDX_003e77538237089ff217a1cfe7"`);
        await queryRunner.query(`DROP TABLE "post_hashtags"`);
        await queryRunner.query(`DROP INDEX "IDX_e2fe567ad8d305fefc918d44f5"`);
        await queryRunner.query(`DROP TABLE "likes"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "IDX_ed35f6b8520ae588c4d39770ff"`);
        await queryRunner.query(`DROP TABLE "follows"`);
        await queryRunner.query(`DROP INDEX "IDX_65d5fbf616c25e628a12898e68"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP INDEX "IDX_7fedde18872deb14e4889361d7"`);
        await queryRunner.query(`DROP TABLE "hashtags"`);
    }

}
