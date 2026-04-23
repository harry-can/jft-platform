import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const questions = await prisma.question.findMany({
      where: {
        ...(category ? { category: category as any } : {}),
      },
      take: 10,
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error("Practice API error:", error);

    return NextResponse.json(
      {
        error: "Failed to load practice questions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}