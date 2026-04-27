
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/roles";

function daysBetween(a: Date, b: Date) {
  const diff = a.getTime() - b.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

async function createNotificationOnce(params: {
  userId: string;
  type: "INFO" | "ASSIGNMENT" | "WEAKNESS" | "RESULT" | "STREAK" | "SYSTEM";
  title: string;
  message: string;
  href?: string;
}) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const existing = await prisma.notification.findFirst({
    where: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      createdAt: {
        gte: since,
      },
    },
  });

  if (existing) return null;

  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      href: params.href || null,
    },
  });
}

export async function POST() {
  const { user, response } = await requireUser();
  if (response) return response;

  const now = new Date();

  const memberships = await prisma.classMember.findMany({
    where: {
      userId: user!.id,
    },
    include: {
      classRoom: {
        include: {
          assignments: {
            include: {
              practiceSet: {
                include: {
                  attempts: {
                    where: {
                      userId: user!.id,
                      status: {
                        in: ["SUBMITTED", "AUTO_SUBMITTED"],
                      },
                    },
                    orderBy: {
                      startedAt: "desc",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  let createdCount = 0;

  for (const membership of memberships) {
    for (const assignment of membership.classRoom.assignments) {
      const completed = assignment.practiceSet.attempts.length > 0;
      const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;

      if (completed) continue;

      if (!dueDate) {
        continue;
      }

      const daysLeft = daysBetween(dueDate, now);

      if (daysLeft < 0) {
        const created = await createNotificationOnce({
          userId: user!.id,
          type: "ASSIGNMENT",
          title: "Assignment overdue",
          message: `${assignment.practiceSet.title} from ${membership.classRoom.name} is overdue.`,
          href: `/test-engine?mode=SET&setId=${assignment.practiceSet.id}`,
        });

        if (created) createdCount++;
      } else if (daysLeft <= 2) {
        const created = await createNotificationOnce({
          userId: user!.id,
          type: "ASSIGNMENT",
          title: "Assignment due soon",
          message: `${assignment.practiceSet.title} is due in ${daysLeft} day(s).`,
          href: `/test-engine?mode=SET&setId=${assignment.practiceSet.id}`,
        });

        if (created) createdCount++;
      }
    }
  }

  const wrongRetrySets = await prisma.wrongRetrySet.findMany({
    where: {
      userId: user!.id,
      isCompleted: false,
    },
    include: {
      items: true,
      sourceAttempt: {
        include: {
          practiceSet: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  for (const retrySet of wrongRetrySets) {
    const unresolved = retrySet.items.filter((item) => !item.isResolved).length;

    if (unresolved > 0) {
      const created = await createNotificationOnce({
        userId: user!.id,
        type: "WEAKNESS",
        title: "Wrong practice pending",
        message: `${unresolved} wrong question(s) remaining from ${retrySet.sourceAttempt.practiceSet.title}.`,
        href: `/wrong-retry/${retrySet.id}`,
      });

      if (created) createdCount++;
    }
  }

  const latestAttempt = await prisma.attempt.findFirst({
    where: {
      userId: user!.id,
      status: {
        in: ["SUBMITTED", "AUTO_SUBMITTED"],
      },
    },
    include: {
      practiceSet: true,
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  if (latestAttempt && latestAttempt.submittedAt) {
    const submittedAt = new Date(latestAttempt.submittedAt);
    const minutesAgo = (now.getTime() - submittedAt.getTime()) / (1000 * 60);

    if (minutesAgo <= 60) {
      const created = await createNotificationOnce({
        userId: user!.id,
        type: "RESULT",
        title: "New result available",
        message: `${latestAttempt.practiceSet.title}: ${Number(
          latestAttempt.accuracy || 0
        ).toFixed(1)}% — ${latestAttempt.resultLabel || "Result"}.`,
        href: `/results/${latestAttempt.id}`,
      });

      if (created) createdCount++;
    }
  }

  if (user!.streakDays > 0) {
    const created = await createNotificationOnce({
      userId: user!.id,
      type: "STREAK",
      title: "Keep your study streak",
      message: `You have a ${user!.streakDays}-day study streak. Complete one lesson or practice today.`,
      href: "/student/home",
    });

    if (created) createdCount++;
  }

  return NextResponse.json({
    success: true,
    createdCount,
  });
}
