import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SetType } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category");
  const setId = searchParams.get("setId");

  if (setId) {
    const set = await prisma.practiceSet.findUnique({
      where: { id: setId },
      include: {
        questions: {
          where: { isPublished: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json(set?.questions || []);
  }

  const questions = await prisma.question.findMany({
    where: {
      isPublished: true,
      practiceSet: {
        isPublished: true,
        type: {
          in: [SetType.CATEGORY_PRACTICE, SetType.FULL_PRACTICE],
        },
      },
      ...(category ? { category: category as any } : {}),
    },
    take: 20,
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(questions);
}