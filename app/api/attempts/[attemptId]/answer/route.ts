import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const body = await req.json();

  const { questionId, selectedChoiceId, timeSpentSec, flagged } = body;

  if (!questionId || !selectedChoiceId) {
    return NextResponse.json(
      { error: "questionId and selectedChoiceId are required" },
      { status: 400 }
    );
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const isCorrect = question.answer === selectedChoiceId;

  const existing = await prisma.attemptAnswer.findFirst({
    where: {
      attemptId,
      questionId,
    },
  });

  let answer;

  if (existing) {
    answer = await prisma.attemptAnswer.update({
      where: { id: existing.id },
      data: {
        selectedChoiceId,
        isCorrect,
        timeSpentSec,
        flagged: !!flagged,
      },
    });
  } else {
    answer = await prisma.attemptAnswer.create({
      data: {
        attemptId,
        questionId,
        selectedChoiceId,
        isCorrect,
        timeSpentSec,
        flagged: !!flagged,
      },
    });
  }

  return NextResponse.json(answer);
}