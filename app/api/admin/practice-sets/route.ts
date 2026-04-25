import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { SetType, UserRole } from "@/generated/prisma/client";

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const sets = await prisma.practiceSet.findMany({
    include: {
      questions: true,
      attempts: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(sets);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json();

  const set = await prisma.practiceSet.create({
    data: {
      title: body.title,
      description: body.description || null,
      type: body.type || SetType.CATEGORY_PRACTICE,
      category: body.category || null,
      difficulty: body.difficulty || null,
      isPublished: !!body.isPublished,
      timeLimitMin: body.timeLimitMin ? Number(body.timeLimitMin) : null,
      audioReplayLimit: body.audioReplayLimit
        ? Number(body.audioReplayLimit)
        : null,
      createdById: user.id,
    },
  });

  return NextResponse.json(set);
}