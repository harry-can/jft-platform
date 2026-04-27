
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/roles";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  const lessons = await prisma.lesson.findMany({
    where: {
      isPublished: true,
    },
    include: {
      progress: {
        where: {
          userId: user!.id,
        },
      },
    },
    orderBy: {
      orderIndex: "asc",
    },
  });

  return NextResponse.json(
    lessons.map((lesson) => ({
      ...lesson,
      completed: lesson.progress[0]?.completed || false,
    }))
  );
}
