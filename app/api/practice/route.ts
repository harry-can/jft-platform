import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const questions = await prisma.question.findMany({
    where: {
      ...(category ? { category: category as any } : {}),
    },
    take: 10,
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(questions);
}