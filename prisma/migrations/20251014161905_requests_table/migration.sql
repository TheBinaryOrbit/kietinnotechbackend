/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `collegeStudent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `researcher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `schoolStudent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[founderUid]` on the table `startup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `startup` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `collegeStudent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `researcher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `schoolStudent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `founderUid` to the `startup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `startup` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "requestStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- AlterTable
ALTER TABLE "collegeStudent" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "researcher" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "schoolStudent" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "startup" ADD COLUMN     "founderUid" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "team" ADD COLUMN     "requestsCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "requests" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "requestedById" INTEGER NOT NULL,
    "requestedToId" INTEGER NOT NULL,
    "status" "requestStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collegeStudent_userId_key" ON "collegeStudent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "researcher_userId_key" ON "researcher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "schoolStudent_userId_key" ON "schoolStudent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "startup_founderUid_key" ON "startup"("founderUid");

-- CreateIndex
CREATE UNIQUE INDEX "startup_userId_key" ON "startup"("userId");

-- AddForeignKey
ALTER TABLE "collegeStudent" ADD CONSTRAINT "collegeStudent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup" ADD CONSTRAINT "startup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schoolStudent" ADD CONSTRAINT "schoolStudent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "researcher" ADD CONSTRAINT "researcher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_requestedToId_fkey" FOREIGN KEY ("requestedToId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
