
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/roles";
import { UserRole } from "@/generated/prisma/client";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { attemptId } = await params;

  const attempt = await prisma.attempt.findUnique({
    where: {
      id: attemptId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      practiceSet: true,
      answers: {
        include: {
          question: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      wrongRetrySet: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  const isOwner = attempt.userId === user!.id;
  const isAdminOrTeacher =
    user!.role === UserRole.ADMIN || user!.role === UserRole.TEACHER;

  if (!isOwner && !isAdminOrTeacher) {
    return NextResponse.json({ error: "No access to this result" }, { status: 403 });
  }

  const totalQuestions = attempt.totalQuestions || attempt.answers.length;
  const correct = attempt.correctCount || attempt.answers.filter((a) => a.isCorrect).length;
  const percent =
    totalQuestions > 0
      ? Number(((correct / totalQuestions) * 100).toFixed(2))
      : Number(attempt.accuracy || 0);

  const wrongRetrySetId = attempt.wrongRetrySet?.id || null;

  const categoryStats: Record<
    string,
    {
      total: number;
      correct: number;
      accuracy: number;
    }
  > = {};

  for (const answer of attempt.answers) {
    const category = String(answer.question.category);

    if (!categoryStats[category]) {
      categoryStats[category] = {
        total: 0,
        correct: 0,
        accuracy: 0,
      };
    }

    categoryStats[category].total += 1;

    if (answer.isCorrect) {
      categoryStats[category].correct += 1;
    }
  }

  for (const category of Object.keys(categoryStats)) {
    const item = categoryStats[category];
    item.accuracy =
      item.total > 0 ? Number(((item.correct / item.total) * 100).toFixed(2)) : 0;
  }

  return NextResponse.json({
    id: attempt.id,
    type: attempt.type,
    status: attempt.status,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    totalScore: attempt.totalScore,
    totalQuestions,
    correctCount: correct,
    accuracy: percent,
    resultLabel: attempt.resultLabel,
    timeSpentSec: attempt.timeSpentSec,
    wrongRetrySetId,
    user: attempt.user,
    practiceSet: attempt.practiceSet,
    exam: attempt.practiceSet,
    categoryStats,
    answers: attempt.answers.map((answer) => ({
      id: answer.id,
      selectedChoiceId: answer.selectedChoiceId,
      isCorrect: answer.isCorrect,
      timeSpentSec: answer.timeSpentSec,
      flagged: answer.flagged,
      question: {
        id: answer.question.id,
        text: answer.question.text,
        category: answer.question.category,
        difficulty: answer.question.difficulty,
        type: answer.question.type,
        options: answer.question.options,
        answer: answer.question.answer,
        explanation: answer.question.explanation,
        imageUrl: answer.question.imageUrl,
        audioUrl: answer.question.audioUrl,
        transcript: answer.question.transcript,
      },
    })),
  });
}
