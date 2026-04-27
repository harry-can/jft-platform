
import { prisma } from "@/lib/prisma";
import { BadgeType } from "@/generated/prisma/client";

export async function awardBadge(params: {
  userId: string;
  type: BadgeType;
  title: string;
  message?: string;
}) {
  await prisma.userBadge.upsert({
    where: {
      userId_type: {
        userId: params.userId,
        type: params.type,
      },
    },
    update: {},
    create: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message || null,
    },
  });
}

export async function evaluateBadges(userId: string) {
  const attempts = await prisma.attempt.findMany({
    where: {
      userId,
      status: {
        in: ["SUBMITTED", "AUTO_SUBMITTED"],
      },
    },
  });

  if (attempts.length >= 1) {
    await awardBadge({
      userId,
      type: "FIRST_TEST",
      title: "First Test",
      message: "Completed your first test.",
    });
  }

  const bestAccuracy = Math.max(...attempts.map((a) => Number(a.accuracy || 0)), 0);

  if (bestAccuracy >= 90) {
    await awardBadge({
      userId,
      type: "EXAM_READY",
      title: "Exam Ready",
      message: "Scored 90% or higher.",
    });
  }

  const completedWrongRetry = await prisma.wrongRetrySet.count({
    where: {
      userId,
      isCompleted: true,
    },
  });

  if (completedWrongRetry > 0) {
    await awardBadge({
      userId,
      type: "WRONG_RETRY_100",
      title: "100% Wrong Retry",
      message: "Solved all wrong questions in a retry set.",
    });
  }
}
