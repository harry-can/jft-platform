import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const attempts = await prisma.attempt.findMany({
    where: { userId },
    orderBy: { startedAt: "asc" },
  });

  const weaknesses = await prisma.weaknessProfile.findMany({
    where: { userId },
  });

  return NextResponse.json({ attempts, weaknesses });
}