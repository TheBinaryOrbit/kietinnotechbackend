-- CreateEnum
CREATE TYPE "participationCategory" AS ENUM ('school', 'college', 'researcher', 'startup');

-- CreateEnum
CREATE TYPE "StartupStage" AS ENUM ('ideation', 'prototype', 'early', 'scaling');

-- CreateEnum
CREATE TYPE "department" AS ENUM ('CSE', 'IT', 'CSIT', 'CS', 'CSE_AI', 'CSE_AIML', 'ECE', 'ELCE', 'EEE', 'ME', 'CSE_Cyber_Security', 'CSE_Data_Science', 'ECE_VLSI', 'AMIA', 'Other');

-- CreateEnum
CREATE TYPE "degree" AS ENUM ('Masters', 'PhD', 'Other');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phonenumber" TEXT,
    "googleId" TEXT,
    "profileImage" TEXT,
    "participationCategory" "participationCategory",
    "isKietian" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problemStatement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "problemStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collegeStudent" (
    "id" SERIAL NOT NULL,
    "college" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "branch" "department" NOT NULL,

    CONSTRAINT "collegeStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startup" (
    "id" SERIAL NOT NULL,
    "startupName" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "startupSector" TEXT NOT NULL,
    "stage" "StartupStage" NOT NULL DEFAULT 'ideation',
    "city" TEXT NOT NULL,
    "teamSize" INTEGER NOT NULL,
    "founderName" TEXT NOT NULL,
    "founderEmail" TEXT NOT NULL,
    "founderPhonenumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "problemSolving" TEXT NOT NULL,
    "uvp" TEXT NOT NULL,
    "pitchDeckLink" TEXT NOT NULL,
    "isFunded" BOOLEAN NOT NULL DEFAULT false,
    "fundedBy" TEXT,
    "eventExpections" TEXT NOT NULL DEFAULT 'others',
    "additionalInfo" TEXT,

    CONSTRAINT "startup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schoolStudent" (
    "id" SERIAL NOT NULL,
    "school" TEXT NOT NULL,
    "standard" INTEGER NOT NULL,
    "board" TEXT NOT NULL,
    "uid" TEXT NOT NULL,

    CONSTRAINT "schoolStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "researcher" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "universityName" TEXT NOT NULL,
    "pursuingDegree" "degree" NOT NULL,

    CONSTRAINT "researcher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team" (
    "id" SERIAL NOT NULL,
    "teamName" TEXT NOT NULL,
    "teamCode" TEXT NOT NULL,
    "leaderUserId" INTEGER NOT NULL,
    "participationCategory" "participationCategory",
    "member1Id" INTEGER,
    "member2Id" INTEGER,
    "member3Id" INTEGER,
    "member4Id" INTEGER,
    "isKeitian" BOOLEAN NOT NULL DEFAULT false,
    "teamSize" INTEGER,
    "categoryId" INTEGER,
    "problemStatementId" INTEGER,
    "startupId" INTEGER,
    "schoolStudentId" INTEGER,
    "researcherId" INTEGER,
    "inovationIdeaName" TEXT,
    "inovationIdeaDesc" TEXT,
    "department" "department" NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phonenumber_key" ON "user"("phonenumber");

-- CreateIndex
CREATE UNIQUE INDEX "user_googleId_key" ON "user"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "schoolStudent_uid_key" ON "schoolStudent"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "researcher_uid_key" ON "researcher"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "team_teamCode_key" ON "team"("teamCode");

-- CreateIndex
CREATE UNIQUE INDEX "team_schoolStudentId_key" ON "team"("schoolStudentId");

-- CreateIndex
CREATE UNIQUE INDEX "team_researcherId_key" ON "team"("researcherId");

-- AddForeignKey
ALTER TABLE "problemStatement" ADD CONSTRAINT "problemStatement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_leaderUserId_fkey" FOREIGN KEY ("leaderUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_member1Id_fkey" FOREIGN KEY ("member1Id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_member2Id_fkey" FOREIGN KEY ("member2Id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_member3Id_fkey" FOREIGN KEY ("member3Id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_member4Id_fkey" FOREIGN KEY ("member4Id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_problemStatementId_fkey" FOREIGN KEY ("problemStatementId") REFERENCES "problemStatement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_schoolStudentId_fkey" FOREIGN KEY ("schoolStudentId") REFERENCES "schoolStudent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "researcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
