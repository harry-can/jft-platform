import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const exams = await prisma.practiceSet.findMany({
      where: {
        type: "OFFICIAL_EXAM",
        isPublished: true,
      },
      include: {
        questions: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      exams: exams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        description: exam.description,
        timeLimitMin: exam.timeLimitMin || 60,
        totalQuestions: exam.questions.length,
        category: exam.category,
        difficulty: exam.difficulty,
      })),
    });
  } catch (error) {
    console.error("Official exams error:", error);

    return NextResponse.json(
      { error: "Failed to load official exams" },
      { status: 500 }
    );
  }
}