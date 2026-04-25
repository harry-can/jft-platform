import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      take: 10,
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Practice API error:", error);
    return NextResponse.json(
      { error: "Failed to load questions" },
      { status: 500 }
    );
  }
}