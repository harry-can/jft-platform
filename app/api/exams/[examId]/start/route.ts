import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  const { examId } = await params;

  const user = await prisma.user.findFirst({
    where: { role: UserRole.STUDENT },
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
    examId: examId,
  } as any,
});

  return NextResponse.json(attempt);
}