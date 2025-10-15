/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "team" ALTER COLUMN "teamName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "userId" TEXT NOT NULL DEFAULT substr(md5(random()::text), 1, 6);

-- CreateIndex
CREATE UNIQUE INDEX "user_userId_key" ON "user"("userId");
