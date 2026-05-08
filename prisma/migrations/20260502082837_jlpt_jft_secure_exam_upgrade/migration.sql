-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('JLPT', 'JFT');

-- CreateEnum
CREATE TYPE "JLPTLevel" AS ENUM ('N5', 'N4', 'N3', 'N2', 'N1', 'JFT_BASIC');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AttemptStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "AttemptStatus" ADD VALUE 'LOCKED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'EXAM_VIOLATION';
ALTER TYPE "AuditAction" ADD VALUE 'EXAM_LOCKED';

-- AlterEnum
ALTER TYPE "QuestionCategory" ADD VALUE 'VOCABULARY';

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "fullscreenRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lockedReason" TEXT,
ADD COLUMN     "secureMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "violations" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PracticeSet" ADD COLUMN     "examType" "ExamType" NOT NULL DEFAULT 'JLPT',
ADD COLUMN     "isOfficial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "level" "JLPTLevel" NOT NULL DEFAULT 'N5';

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "replayLimit" SET DEFAULT 2;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentLevel" "JLPTLevel" NOT NULL DEFAULT 'N5',
ALTER COLUMN "avatarUrl" SET DEFAULT '/images/default-student.png';

-- AlterTable
ALTER TABLE "WeaknessProfile" ADD COLUMN     "wrongCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ExamLog" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamLog_attemptId_idx" ON "ExamLog"("attemptId");

-- AddForeignKey
ALTER TABLE "ExamLog" ADD CONSTRAINT "ExamLog_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
