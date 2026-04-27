
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/roles";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  const attempts = await prisma.attempt.findMany({
    where: {
      userId: user!.id,
      status: {
        in: ["SUBMITTED", "AUTO_SUBMITTED"],
      },
    },
    include: {
      practiceSet: true,
      answers: {
        include: {
          question: true,
        },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
  });

  const weaknessProfiles = await prisma.weaknessProfile.findMany({
    where: {
      userId: user!.id,
    },
    orderBy: {
      accuracy: "asc",
    },
  });

  const wrongRetrySets = await prisma.wrongRetrySet.findMany({
    where: {
      userId: user!.id,
      isCompleted: false,
    },
    include: {
      items: true,
      sourceAttempt: {
        include: {
          practiceSet: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalAttempts = attempts.length;
  const avgAccuracy =
    totalAttempts > 0
      ? Number(
          (
            attempts.reduce((sum, a) => sum + (a.accuracy || 0), 0) / totalAttempts
          ).toFixed(2)
        )
      : 0;

  const totalAnswered = attempts.reduce((sum, a) => sum + (a.totalQuestions || 0), 0);
  const totalCorrect = attempts.reduce((sum, a) => sum + (a.correctCount || 0), 0);

  const categoryBreakdown: Record<
    string,
    { total: number; correct: number; accuracy: number }
  > = {};

  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      const category = String(answer.question.category);

      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = {
          total: 0,
          correct: 0,
          accuracy: 0,
        };
      }

      categoryBreakdown[category].total += 1;
      if (answer.isCorrect) categoryBreakdown[category].correct += 1;
    }
  }

  for (const category of Object.keys(categoryBreakdown)) {
    const item = categoryBreakdown[category];
    item.accuracy =
      item.total > 0 ? Number(((item.correct / item.total) * 100).toFixed(2)) : 0;
  }

  return NextResponse.json({
    user: {
      id: user!.id,
      name: user!.name,
      email: user!.email,
      role: user!.role,
    },
    summary: {
      totalAttempts,
      avgAccuracy,
      totalAnswered,
      totalCorrect,
    },
    weaknessProfiles,
    categoryBreakdown,
    wrongRetrySets,
    attempts,
  });
}
