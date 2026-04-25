import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { UserRole } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const practiceSetId = searchParams.get("practiceSetId");

  const questions = await prisma.question.findMany({
    where: practiceSetId ? { practiceSetId } : {},
    include: {
      practiceSet: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(questions);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json();

  const question = await prisma.question.create({
    data: {
      practiceSetId: body.practiceSetId,
      text: body.text,
      category: body.category,
      difficulty: body.difficulty || "MEDIUM",
      type: body.type || "mcq",
      options: body.options,
      answer: body.answer,
      imageUrl: body.imageUrl || null,
      audioUrl: body.audioUrl || null,
      explanation: body.explanation || null,
      tags: body.tags || [],
      points: body.points ? Number(body.points) : 1,
    },
  });

  return NextResponse.json(question);
}