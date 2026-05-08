import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const exam = await prisma.practiceSet.findUnique({
      where: {
        id: params.examId,
      },
      include: {
        questions: {
          where: {
            isPublished: true,
          },
          orderBy: {
            orderIndex: "asc",
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
      success: true,
      exam,
    });
  } catch (error) {
    console.error("Get exam error:", error);

    return NextResponse.json(
      { error: "Failed to load exam" },
      { status: 500 }
    );
  }
}