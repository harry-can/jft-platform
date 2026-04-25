import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SetType } from "@/generated/prisma/client";

export async function GET() {
  const exams = await prisma.practiceSet.findMany({
    where: {
      type: SetType.OFFICIAL_EXAM,
      isPublished: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(exams);
}