import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;

  const answers = await prisma.attemptAnswer.findMany({
    where: { attemptId },
  });

  const totalCorrect = answers.filter((a) => a.isCorrect).length;
  const totalScore = totalCorrect;

  const resultLabel =
    totalCorrect >= 70
      ? "Ready"
      : totalCorrect >= 50
      ? "Almost Ready"
      : "Needs Improvement";

  const attempt = await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      submittedAt: new Date(),
      totalScore,
      resultLabel,
    },
  });

  return NextResponse.json(attempt);
}