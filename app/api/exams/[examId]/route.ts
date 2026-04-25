import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  const { examId } = await params;

  const exam = await prisma.practiceSet.findUnique({
    where: { id: examId },
    include: {
      questions: {
        where: { isPublished: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  return NextResponse.json(exam);
}