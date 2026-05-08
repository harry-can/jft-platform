import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const exam = await prisma.practiceSet.findUnique({
      where: { id: params.examId },
      include: {
        questions: {
          where: { isPublished: true },
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            text: true,
            category: true,
            difficulty: true,
            type: true,
            options: true,
            imageUrl: true,
            audioUrl: true,
            replayLimit: true,
            points: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      type: exam.type,
      timeLimitMin: exam.timeLimitMin || 60,
      questions: exam.questions,
    });
  } catch (error) {
    console.error("Fetch questions error:", error);

    return NextResponse.json(
      { error: "Failed to load questions" },
      { status: 500 }
    );
  }
}