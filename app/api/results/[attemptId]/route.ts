import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CategoryStats = {
  total: number;
  correct: number;
};

type CategoryBreakdown = Record<string, CategoryStats>;

type AnswerWithQuestion = {
  isCorrect: boolean | null;
  question: {
    category: string;
  };
};

export async function GET(
  _: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: true,
      answers: {
        include: {
          question: true,
        },
      },
      user: true,
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  const groupedByCategory = attempt.answers.reduce(
    (acc: CategoryBreakdown, ans: AnswerWithQuestion) => {
      const cat = String(ans.question.category);

      if (!acc[cat]) {
        acc[cat] = { total: 0, correct: 0 };
      }

      acc[cat].total += 1;
      if (ans.isCorrect) acc[cat].correct += 1;

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
    user: attempt.user,
    answers: attempt.answers,
    categoryBreakdown: groupedByCategory,
  });
}