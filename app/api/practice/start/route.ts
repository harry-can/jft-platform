
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/roles";
import {
  AttemptType,
  QuestionCategory,
  SetType,
} from "@/generated/prisma/client";

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body = await req.json().catch(() => ({}));

  const mode = String(body.mode || "FULL");
  const category = body.category as QuestionCategory | undefined;
  const setId = body.setId as string | undefined;
  const retrySetId = body.retrySetId as string | undefined;

  if (mode === "WRONG_RETRY") {
    if (!retrySetId) {
      return NextResponse.json({ error: "retrySetId is required" }, { status: 400 });
    }

    const retrySet = await prisma.wrongRetrySet.findFirst({
      where: {
        id: retrySetId,
        userId: user!.id,
      },
      include: {
        sourceAttempt: true,
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

    const attempt = await prisma.attempt.create({
      data: {
        userId: user!.id,
        practiceSetId: retrySet.sourceAttempt.practiceSetId,
        type: AttemptType.WRONG_RETRY,
        parentAttemptId: retrySet.sourceAttemptId,
      },
    });

    return NextResponse.json({
      attempt,
      retrySetId,
      questions: retrySet.items.map((item) => item.question),
      mode: "WRONG_RETRY",
    });
  }

  let practiceSet = null;

  if (setId) {
    practiceSet = await prisma.practiceSet.findFirst({
      where: {
        id: setId,
        isPublished: true,
      },
      include: {
        questions: {
          where: {
            isPublished: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });
  } else if (mode === "CATEGORY") {
    if (!category) {
      return NextResponse.json({ error: "category is required" }, { status: 400 });
    }

    practiceSet = await prisma.practiceSet.findFirst({
      where: {
        type: SetType.CATEGORY_PRACTICE,
        category,
        isPublished: true,
      },
      include: {
        questions: {
          where: {
            isPublished: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } else if (mode === "OFFICIAL_EXAM") {
    practiceSet = await prisma.practiceSet.findFirst({
      where: {
        type: SetType.OFFICIAL_EXAM,
        isPublished: true,
      },
      include: {
        questions: {
          where: {
            isPublished: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } else {
    practiceSet = await prisma.practiceSet.findFirst({
      where: {
        type: SetType.FULL_PRACTICE,
        isPublished: true,
      },
      include: {
        questions: {
          where: {
            isPublished: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  if (!practiceSet) {
    return NextResponse.json({ error: "No published practice set found" }, { status: 404 });
  }

  const attemptType =
    practiceSet.type === SetType.OFFICIAL_EXAM
      ? AttemptType.OFFICIAL_EXAM
      : AttemptType.PRACTICE;

  const attempt = await prisma.attempt.create({
    data: {
      userId: user!.id,
      practiceSetId: practiceSet.id,
      type: attemptType,
    },
  });

  return NextResponse.json({
    attempt,
    practiceSet,
    questions: practiceSet.questions,
    mode,
  });
}
