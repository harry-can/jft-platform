import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json();
  const { answers } = body as {
    answers: Record<string, string>;
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

  const exam = await prisma.exam.findFirst();

  if (!exam) {
    return NextResponse.json({ error: "No exam found" }, { status: 400 });
  }

  const attempt = await prisma.attempt.create({
    data: {
      userId: user.id,
      examId: exam.id,
    },
  });

  let totalCorrect = 0;

  for (const q of questions) {
    const selected = answers[q.id];
    const isCorrect = selected === q.answer;

    if (isCorrect) totalCorrect++;

    await prisma.attemptAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: q.id,
        selectedChoiceId: selected,
        isCorrect,
      },
    });
  }

  await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      submittedAt: new Date(),
      totalScore: totalCorrect,
      resultLabel:
        totalCorrect >= questions.length * 0.8
          ? "Ready"
          : totalCorrect >= questions.length * 0.5
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
    const correctCount = (previous?.correctCount || 0) + stats.correct;
    const accuracy = attemptsCount > 0 ? (correctCount / attemptsCount) * 100 : 0;

    await prisma.weaknessProfile.upsert({
      where: {
        userId_category: {
          userId: user.id,
          category: category as any,
        },
      },
      update: {
        attemptsCount,
        correctCount,
        accuracy,
        weaknessLevel: accuracy < 50 ? "weak" : accuracy < 75 ? "developing" : "strong",
      },
      create: {
        userId: user.id,
        category: category as any,
        attemptsCount,
        correctCount,
        accuracy,
        weaknessLevel: accuracy < 50 ? "weak" : accuracy < 75 ? "developing" : "strong",
      },
    });
  }

  return NextResponse.json({
    attemptId: attempt.id,
    totalScore: totalCorrect,
    totalQuestions: questions.length,
  });
}