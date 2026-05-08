import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const questions = body.questions;

  const result = await prisma.question.createMany({
    data: questions.map((q: any, index: number) => ({
      testSetId: q.testSetId,
      text: q.text,
      category: q.category,
      difficulty: q.difficulty,
      type: q.type || "mcq",
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      audioUrl: q.audioUrl,
      transcript: q.transcript,
      orderIndex: index,
    })),
  });

  return NextResponse.json({
    success: true,
    count: result.count,
  });
}