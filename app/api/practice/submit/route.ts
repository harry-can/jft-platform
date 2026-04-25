import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { AttemptStatus, AttemptType } from "@/generated/prisma/client";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json();
  const { answers, practiceSetId, attemptType } = body as {
    answers: Record<string, string>;
    practiceSetId?: string;
    attemptType?: AttemptType;
  };

  if (!answers || Object.keys(answers).length === 0) {
    return NextResponse.json({ error: "No answers submitted" }, { status: 400 });
  }

  const questions = await prisma.question.findMany({
    where: {
      id: {
        in: Object.keys(answers),
      },
    },
  });

  const fallbackSet = await prisma.practiceSet.findFirst();

  if (!fallbackSet && !practiceSetId) {
    return NextResponse.json({ error: "No practice set found" }, { status: 400 });
  }

  const attempt = await prisma.attempt.create({
    data: {
      userId: user.id,
      practiceSetId: practiceSetId || fallbackSet!.id,
      type: attemptType || AttemptType.PRACTICE,
      status: AttemptStatus.SUBMITTED,
      submittedAt: new Date(),
    },
  });

  let correctCount = 0;

  const wrongQuestionIds: string[] = [];

  for (const q of questions) {
    const selected = answers[q.id];
    const isCorrect = selected === q.answer;

    if (isCorrect) {
      correctCount++;
    } else {
      wrongQuestionIds.push(q.id);
    }

    await prisma.attemptAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: q.id,
        selectedChoiceId: selected,
        isCorrect,
      },
    });
  }

  const accuracy =
    questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

  await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      totalScore: correctCount,
      totalQuestions: questions.length,
      correctCount,
      accuracy,
      resultLabel:
        accuracy >= 80
          ? "Ready"
          : accuracy >= 50
          ? "Almost Ready"
          : "Needs Improvement",
    },
  });

  const grouped: Record<string, { total: number; correct: number }> = {};

  for (const q of questions) {
    const category = q.category;
    if (!grouped[category]) grouped[category] = { total: 0, correct: 0 };
    grouped[category].total++;
    if (answers[q.id] === q.answer) grouped[category].correct++;
  }

  for (const [category, stats] of Object.entries(grouped)) {
    const previous = await prisma.weaknessProfile.findUnique({
      where: {
        userId_category: {
          userId: user.id,
          category: category as any,
        },
      },
    });

    const attemptsCount = (previous?.attemptsCount || 0) + stats.total;
    const correctTotal = (previous?.correctCount || 0) + stats.correct;
    const newAccuracy =
      attemptsCount > 0 ? (correctTotal / attemptsCount) * 100 : 0;

    await prisma.weaknessProfile.upsert({
      where: {
        userId_category: {
          userId: user.id,
          category: category as any,
        },
      },
      update: {
        attemptsCount,
        correctCount: correctTotal,
        accuracy: newAccuracy,
        weaknessLevel:
          newAccuracy < 50
            ? "weak"
            : newAccuracy < 75
            ? "developing"
            : "strong",
      },
      create: {
        userId: user.id,
        category: category as any,
        attemptsCount,
        correctCount: correctTotal,
        accuracy: newAccuracy,
        weaknessLevel:
          newAccuracy < 50
            ? "weak"
            : newAccuracy < 75
            ? "developing"
            : "strong",
      },
    });
  }

  let wrongRetrySetId: string | null = null;

  const wrongRate =
    questions.length > 0 ? wrongQuestionIds.length / questions.length : 0;

  if (wrongRate > 0.5 && wrongQuestionIds.length > 0) {
    const retrySet = await prisma.wrongRetrySet.create({
      data: {
        userId: user.id,
        sourceAttemptId: attempt.id,
      },
    });

    wrongRetrySetId = retrySet.id;

    await prisma.wrongQuestionItem.createMany({
      data: wrongQuestionIds.map((questionId) => ({
        wrongRetrySetId: retrySet.id,
        questionId,
      })),
    });
  }

  return NextResponse.json({
    attemptId: attempt.id,
    totalScore: correctCount,
    totalQuestions: questions.length,
    accuracy,
    wrongCount: wrongQuestionIds.length,
    shouldRetryWrong:
      wrongQuestionIds.length > 0 && wrongQuestionIds.length / questions.length > 0.5,
    wrongRetrySetId,
  });
}