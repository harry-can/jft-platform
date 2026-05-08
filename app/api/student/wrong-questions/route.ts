import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wrongAnswers = await prisma.attemptAnswer.findMany({
      where: {
        isCorrect: false,
        attempt: {
          userId: currentUser.id,
        },
      },
      include: {
        question: true,
        attempt: {
          include: {
            practiceSet: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      wrongAnswers,
    });
  } catch (error) {
    console.error("Wrong questions error:", error);
    return NextResponse.json(
      { error: "Failed to load wrong questions" },
      { status: 500 }
    );
  }
}