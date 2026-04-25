import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CategoryStats = {
  total: number;
  correct: number;
};

type CategoryBreakdown = Record<string, CategoryStats>;

export async function GET(
  _: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: true,
      user: true,
      answers: {
        include: {
          question: true,
        },
      },
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  const categoryBreakdown = attempt.answers.reduce(
    (acc: CategoryBreakdown, ans) => {
      const category = String(ans.question.category);

      if (!acc[category]) {
        acc[category] = { total: 0, correct: 0 };
      }

      acc[category].total += 1;
      if (ans.isCorrect) acc[category].correct += 1;

      return acc;
    },
    {} as CategoryBreakdown
  );

  return NextResponse.json({
    id: attempt.id,
    totalScore: attempt.totalScore,
    resultLabel: attempt.resultLabel,
    submittedAt: attempt.submittedAt,
    exam: attempt.exam,
    user: {
      id: attempt.user.id,
      name: attempt.user.name,
      email: attempt.user.email,
    },
    answers: attempt.answers,
    categoryBreakdown,
  });
}