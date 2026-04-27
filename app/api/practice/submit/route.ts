
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/roles";
import {
  AttemptStatus,
  AttemptType,
  QuestionCategory,
} from "@/generated/prisma/client";
import { evaluateBadges } from "@/lib/badges";

function getResultLabel(accuracy: number) {
  if (accuracy >= 90) return "Excellent";
  if (accuracy >= 80) return "Ready";
  if (accuracy >= 50) return "Almost Ready";
  return "Needs Full Review";
}

function getWeaknessLevel(accuracy: number) {
  if (accuracy < 50) return "weak";
  if (accuracy < 75) return "developing";
  return "strong";
}

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body = await req.json();

  const answers = body.answers as Record<string, string>;
  const practiceSetId = body.practiceSetId as string | undefined;
  const retrySetId = body.retrySetId as string | undefined;
  const attemptType = (body.attemptType || AttemptType.PRACTICE) as AttemptType;

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

  if (questions.length === 0) {
    return NextResponse.json({ error: "No valid questions found" }, { status: 400 });
  }

  const finalPracticeSetId = practiceSetId || questions[0].practiceSetId;

  const sourceRetrySet = retrySetId
    ? await prisma.wrongRetrySet.findFirst({
        where: {
          id: retrySetId,
          userId: user!.id,
        },
      })
    : null;

  const attempt = await prisma.attempt.create({
    data: {
      userId: user!.id,
      practiceSetId: finalPracticeSetId,
      type: attemptType,
      status: AttemptStatus.SUBMITTED,
      submittedAt: new Date(),
      parentAttemptId: sourceRetrySet?.sourceAttemptId || null,
    },
  });

  let correctCount = 0;
  const wrongQuestionIds: string[] = [];

  for (const question of questions) {
    const selected = answers[question.id];
    const isCorrect = selected === question.answer;

    if (isCorrect) correctCount += 1;
    else wrongQuestionIds.push(question.id);

    await prisma.attemptAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: question.id,
        selectedChoiceId: selected,
        isCorrect,
      },
    });
  }

  const totalQuestions = questions.length;
  const accuracy =
    totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 100).toFixed(2)) : 0;

  const resultLabel = getResultLabel(accuracy);

  const updatedAttempt = await prisma.attempt.update({
    where: {
      id: attempt.id,
    },
    data: {
      totalScore: correctCount,
      totalQuestions,
      correctCount,
      accuracy,
      resultLabel,
    },
  });

  const grouped: Record<string, { total: number; correct: number }> = {};

  for (const question of questions) {
    const category = String(question.category);

    if (!grouped[category]) grouped[category] = { total: 0, correct: 0 };

    grouped[category].total += 1;

    if (answers[question.id] === question.answer) {
      grouped[category].correct += 1;
    }
  }

  for (const [category, stats] of Object.entries(grouped)) {
    const previous = await prisma.weaknessProfile.findUnique({
      where: {
        userId_category: {
          userId: user!.id,
          category: category as QuestionCategory,
        },
      },
    });

    const attemptsCount = (previous?.attemptsCount || 0) + stats.total;
    const correctTotal = (previous?.correctCount || 0) + stats.correct;
    const newAccuracy =
      attemptsCount > 0 ? Number(((correctTotal / attemptsCount) * 100).toFixed(2)) : 0;

    await prisma.weaknessProfile.upsert({
      where: {
        userId_category: {
          userId: user!.id,
          category: category as QuestionCategory,
        },
      },
      update: {
        attemptsCount,
        correctCount: correctTotal,
        accuracy: newAccuracy,
        weaknessLevel: getWeaknessLevel(newAccuracy),
      },
      create: {
        userId: user!.id,
        category: category as QuestionCategory,
        attemptsCount,
        correctCount: correctTotal,
        accuracy: newAccuracy,
        weaknessLevel: getWeaknessLevel(newAccuracy),
      },
    });
  }

  let wrongRetrySetId: string | null = null;
  let unresolvedWrongCount = wrongQuestionIds.length;

  if (attemptType === AttemptType.WRONG_RETRY && retrySetId) {
    const retrySet = await prisma.wrongRetrySet.findFirst({
      where: {
        id: retrySetId,
        userId: user!.id,
      },
      include: {
        items: true,
      },
    });

    if (retrySet) {
      for (const item of retrySet.items) {
        if (!(item.questionId in answers)) continue;

        const isResolved = !wrongQuestionIds.includes(item.questionId);

        await prisma.wrongQuestionItem.update({
          where: {
            id: item.id,
          },
          data: {
            retryCount: {
              increment: 1,
            },
            isResolved,
            lastTriedAt: new Date(),
          },
        });
      }

      unresolvedWrongCount = await prisma.wrongQuestionItem.count({
        where: {
          wrongRetrySetId: retrySet.id,
          isResolved: false,
        },
      });

      await prisma.wrongRetrySet.update({
        where: {
          id: retrySet.id,
        },
        data: {
          isCompleted: unresolvedWrongCount === 0,
        },
      });

      wrongRetrySetId = retrySet.id;
    }
  } else if (wrongQuestionIds.length > 0 && accuracy >= 50) {
    const retrySet = await prisma.wrongRetrySet.create({
      data: {
        userId: user!.id,
        sourceAttemptId: attempt.id,
        items: {
          create: wrongQuestionIds.map((questionId) => ({
            questionId,
          })),
        },
      },
    });

    wrongRetrySetId = retrySet.id;

    await prisma.notification.create({
      data: {
        userId: user!.id,
        type: "WEAKNESS",
        title: "Wrong-question practice created",
        message: "You scored above 50%. Practice only wrong questions until 100%.",
        href: `/wrong-retry/${retrySet.id}`,
      },
    });
  }

  await evaluateBadges(user!.id);

  return NextResponse.json({
    attemptId: attempt.id,
    attempt: updatedAttempt,
    totalScore: correctCount,
    totalQuestions,
    correctCount,
    wrongCount: wrongQuestionIds.length,
    accuracy,
    resultLabel,
    shouldRetryWrong: wrongQuestionIds.length > 0 && accuracy >= 50,
    shouldRetakeFull: accuracy < 50,
    wrongRetrySetId,
    unresolvedWrongCount,
    completedWrongRetry: attemptType === AttemptType.WRONG_RETRY && unresolvedWrongCount === 0,
  });
}
