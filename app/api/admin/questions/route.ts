import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const questions = await prisma.question.findMany({
    include: {
      exam: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(questions);
}

export async function POST(req: Request) {
  const body = await req.json();

  const { examId, text, category, type, options, answer } = body;

  if (!examId || !text || !category || !type || !answer) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const question = await prisma.question.create({
    data: {
      examId,
      text,
      category,
      type,
      options,
      answer,
    },
  });

  return NextResponse.json(question);
}