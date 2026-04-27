
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/roles";

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body = await req.json();
  const lessonId = String(body.lessonId || "");

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
  }

  const progress = await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user!.id,
        lessonId,
      },
    },
    update: {
      completed: true,
      completedAt: new Date(),
    },
    create: {
      userId: user!.id,
      lessonId,
      completed: true,
      completedAt: new Date(),
    },
  });

  const today = new Date();
  const lastStudy = user!.lastStudyDate;
  const shouldIncrementStreak = !lastStudy || !isSameDay(today, lastStudy);

  await prisma.user.update({
    where: {
      id: user!.id,
    },
    data: {
      xp: {
        increment: 10,
      },
      lastStudyDate: today,
      ...(shouldIncrementStreak
        ? {
            streakDays: {
              increment: 1,
            },
          }
        : {}),
    },
  });

  return NextResponse.json(progress);
}
