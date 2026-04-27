import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/roles";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ retrySetId: string }> }
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { retrySetId } = await params;

  const retrySet = await prisma.wrongRetrySet.findFirst({
    where: {
      id: retrySetId,
      userId: user!.id,
    },
    include: {
      sourceAttempt: {
        include: {
          practiceSet: true,
        },
      },
      items: {
        where: {
          isResolved: false,
        },
        include: {
          question: true,
        },
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!retrySet) {
    return NextResponse.json({ error: "Wrong retry set not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: retrySet.id,
    isCompleted: retrySet.isCompleted,
    sourceAttemptId: retrySet.sourceAttemptId,
    practiceSetId: retrySet.sourceAttempt.practiceSetId,
    practiceSet: retrySet.sourceAttempt.practiceSet,
    unresolvedCount: retrySet.items.length,
    questions: retrySet.items.map((item) => ({
      ...item.question,
      retryCount: item.retryCount,
      wrongItemId: item.id,
    })),
  });
}
