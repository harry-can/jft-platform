import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId, answers, autoSubmit } = body;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        practiceSet: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

    let correctCount = 0;

    for (const question of attempt.practiceSet.questions) {
      const selectedAnswer = answers?.[question.id] || null;
      const isCorrect = selectedAnswer === question.answer;

      if (isCorrect) {
        correctCount++;
      }

      await prisma.attemptAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId,
            questionId: question.id,
          },
        },
        update: {
          selectedChoiceId: selectedAnswer,
          isCorrect,
        },
        create: {
          attemptId,
          questionId: question.id,
          selectedChoiceId: selectedAnswer,
          isCorrect,
        },
      });

      const existingWeakness = await prisma.weaknessProfile.findUnique({
        where: {
          userId_category: {
            userId: attempt.userId,
            category: question.category,
          },
        },
      });

      const newAttemptsCount = (existingWeakness?.attemptsCount || 0) + 1;
      const newCorrectCount =
        (existingWeakness?.correctCount || 0) + (isCorrect ? 1 : 0);

      const newAccuracy =
        newAttemptsCount > 0
          ? Math.round((newCorrectCount / newAttemptsCount) * 100)
          : 0;

      await prisma.weaknessProfile.upsert({
        where: {
          userId_category: {
            userId: attempt.userId,
            category: question.category,
          },
        },
        update: {
          attemptsCount: newAttemptsCount,
          correctCount: newCorrectCount,
          accuracy: newAccuracy,
          weaknessLevel:
            newAccuracy < 50 ? "HIGH" : newAccuracy < 75 ? "MEDIUM" : "LOW",
        },
        create: {
          userId: attempt.userId,
          category: question.category,
          attemptsCount: 1,
          correctCount: isCorrect ? 1 : 0,
          accuracy: isCorrect ? 100 : 0,
          weaknessLevel: isCorrect ? "LOW" : "HIGH",
        },
      });
    }

    const totalQuestions = attempt.practiceSet.questions.length;
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;

    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: autoSubmit ? "AUTO_SUBMITTED" : "SUBMITTED",
        submittedAt: new Date(),
        correctCount,
        totalQuestions,
        accuracy,
        totalScore: accuracy,
        resultLabel:
          accuracy >= 80
            ? "PASS"
            : accuracy >= 60
              ? "NEEDS PRACTICE"
              : "RETRY",
      },
    });

    await prisma.user.update({
      where: { id: attempt.userId },
      data: {
        xp: {
          increment: correctCount * 10,
        },
        streakDays: {
          increment: 1,
        },
        lastStudyDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      accuracy,
      correctCount,
      totalQuestions,
    });
  } catch (error) {
    console.error("Submit exam error:", error);

    return NextResponse.json(
      { error: "Failed to submit exam" },
      { status: 500 }
    );
  }
}