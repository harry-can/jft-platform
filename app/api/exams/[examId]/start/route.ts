import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
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
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    const isOfficialExam = exam.type === "OFFICIAL_EXAM";

    const attempt = await prisma.attempt.create({
      data: {
        userId: currentUser.id,
        practiceSetId: exam.id,
        type: isOfficialExam ? "OFFICIAL_EXAM" : "PRACTICE",
        totalQuestions: exam.questions.length,
        status: "STARTED",
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      durationMin: exam.timeLimitMin || 60,
      totalQuestions: exam.questions.length,
      isOfficial: isOfficialExam,
    });
  } catch (error) {
    console.error("Start exam error:", error);

    return NextResponse.json(
      { error: "Failed to start exam" },
      { status: 500 }
    );
  }
}