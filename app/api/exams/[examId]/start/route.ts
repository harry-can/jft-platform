import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  const { examId } = await params;

  const user = await prisma.user.findFirst({
    where: { role: "student" },
  });

  if (!user) {
    return NextResponse.json(
      { error: "No student user found. Seed the database first." },
      { status: 400 }
    );
  }

  const attempt = await prisma.attempt.create({
    data: {
      userId: user.id,
      examId,
    },
  });

  return NextResponse.json(attempt);
}