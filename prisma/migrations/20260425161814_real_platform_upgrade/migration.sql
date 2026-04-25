/*
  Warnings:

  - You are about to drop the column `examId` on the `Attempt` table. All the data in the column will be lost.
  - You are about to drop the column `examId` on the `Question` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Exam` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[attemptId,questionId]` on the table `AttemptAnswer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[joinCode]` on the table `ClassRoom` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `practiceSetId` to the `Attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `joinCode` to the `ClassRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ClassRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `practiceSetId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WeaknessProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'OFFICIAL');

-- CreateEnum
CREATE TYPE "SetType" AS ENUM ('CATEGORY_PRACTICE', 'FULL_PRACTICE', 'WRONG_RETRY', 'OFFICIAL_EXAM');

-- CreateEnum
CREATE TYPE "AttemptType" AS ENUM ('PRACTICE', 'WRONG_RETRY', 'OFFICIAL_EXAM');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('STARTED', 'SUBMITTED', 'AUTO_SUBMITTED');

-- AlterEnum
ALTER TYPE "QuestionCategory" ADD VALUE 'KANJI';

-- DropForeignKey
ALTER TABLE "Attempt" DROP CONSTRAINT "Attempt_examId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_examId_fkey";

-- AlterTable
ALTER TABLE "Attempt" DROP COLUMN "examId",
ADD COLUMN     "accuracy" DOUBLE PRECISION,
ADD COLUMN     "correctCount" INTEGER,
ADD COLUMN     "parentAttemptId" TEXT,
ADD COLUMN     "practiceSetId" TEXT NOT NULL,
ADD COLUMN     "status" "AttemptStatus" NOT NULL DEFAULT 'STARTED',
ADD COLUMN     "timeSpentSec" INTEGER,
ADD COLUMN     "totalQuestions" INTEGER,
ADD COLUMN     "type" "AttemptType" NOT NULL DEFAULT 'PRACTICE';

-- AlterTable
ALTER TABLE "AttemptAnswer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ClassMember" ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ClassRoom" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "joinCode" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "examId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "difficulty" "QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "orderIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "practiceSetId" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STUDENT';

-- AlterTable
ALTER TABLE "WeaknessProfile" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Exam";

-- CreateTable
CREATE TABLE "PracticeSet" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "SetType" NOT NULL DEFAULT 'CATEGORY_PRACTICE',
    "category" "QuestionCategory",
    "difficulty" "QuestionDifficulty",
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "timeLimitMin" INTEGER,
    "audioReplayLimit" INTEGER,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "classRoomId" TEXT NOT NULL,
    "practiceSetId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WrongRetrySet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceAttemptId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WrongRetrySet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WrongQuestionItem" (
    "id" TEXT NOT NULL,
    "wrongRetrySetId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "lastTriedAt" TIMESTAMP(3),

    CONSTRAINT "WrongQuestionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratorJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "prompt" TEXT,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "outputJson" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratorJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_classRoomId_practiceSetId_key" ON "Assignment"("classRoomId", "practiceSetId");

-- CreateIndex
CREATE UNIQUE INDEX "WrongRetrySet_sourceAttemptId_key" ON "WrongRetrySet"("sourceAttemptId");

-- CreateIndex
CREATE UNIQUE INDEX "WrongQuestionItem_wrongRetrySetId_questionId_key" ON "WrongQuestionItem"("wrongRetrySetId", "questionId");

-- CreateIndex
CREATE INDEX "Attempt_userId_idx" ON "Attempt"("userId");

-- CreateIndex
CREATE INDEX "Attempt_practiceSetId_idx" ON "Attempt"("practiceSetId");

-- CreateIndex
CREATE UNIQUE INDEX "AttemptAnswer_attemptId_questionId_key" ON "AttemptAnswer"("attemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassRoom_joinCode_key" ON "ClassRoom"("joinCode");

-- AddForeignKey
ALTER TABLE "PracticeSet" ADD CONSTRAINT "PracticeSet_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_practiceSetId_fkey" FOREIGN KEY ("practiceSetId") REFERENCES "PracticeSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_classRoomId_fkey" FOREIGN KEY ("classRoomId") REFERENCES "ClassRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_practiceSetId_fkey" FOREIGN KEY ("practiceSetId") REFERENCES "PracticeSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_practiceSetId_fkey" FOREIGN KEY ("practiceSetId") REFERENCES "PracticeSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrongRetrySet" ADD CONSTRAINT "WrongRetrySet_sourceAttemptId_fkey" FOREIGN KEY ("sourceAttemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrongQuestionItem" ADD CONSTRAINT "WrongQuestionItem_wrongRetrySetId_fkey" FOREIGN KEY ("wrongRetrySetId") REFERENCES "WrongRetrySet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrongQuestionItem" ADD CONSTRAINT "WrongQuestionItem_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratorJob" ADD CONSTRAINT "GeneratorJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
