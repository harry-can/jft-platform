import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const test = await prisma.practiceSet.create({
      data: {
        title: body.title,
        description: body.description || null,
        type: body.isOfficial ? "OFFICIAL_EXAM" : "FULL_PRACTICE",
        category: body.category || null,
        difficulty: body.difficulty || null,
        timeLimitMin: Number(body.durationMin || body.timeLimitMin || 60),
        isPublished: true,
      },
    });

    return NextResponse.json({
      success: true,
      id: test.id,
      test,
    });
  } catch (error) {
    console.error("Create test error:", error);

    return NextResponse.json(
      { error: "Failed to create test set" },
      { status: 500 }
    );
  }
}