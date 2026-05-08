import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { attemptId: string } }
) {
  try {
    const attempt = await prisma.attempt.findUnique({
      where: {
        id: params.attemptId,
      },
      include: {
        practiceSet: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    const categoryMap: Record<string, { total: number; correct: number }> = {};

    for (const answer of attempt.answers) {
      const category = answer.question.category;

      if (!categoryMap[category]) {
        categoryMap[category] = {
          total: 0,
          correct: 0,
        };
      }

      categoryMap[category].total++;

      if (answer.isCorrect) {
        categoryMap[category].correct++;
      }
    }

    const categoryScores = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      accuracy: Math.round((data.correct / data.total) * 100),
      total: data.total,
      correct: data.correct,
    }));

    return NextResponse.json({
      success: true,
      attempt,
      categoryScores,
    });
  } catch (error) {
    console.error("Result error:", error);

    return NextResponse.json(
      { error: "Failed to load result" },
      { status: 500 }
    );
  }
}