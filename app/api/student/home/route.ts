
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/roles";
import { getStudentRecommendations } from "@/lib/recommendations";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  const recommendations = await getStudentRecommendations(user!.id);

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user!.id,
      isRead: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const badges = await prisma.userBadge.findMany({
    where: {
      userId: user!.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const attempts = await prisma.attempt.findMany({
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
      startedAt: "desc",
    },
    take: 5,
  });

  return NextResponse.json({
    user: {
      id: user!.id,
      name: user!.name,
      email: user!.email,
      xp: user!.xp,
      streakDays: user!.streakDays,
      subscriptionPlan: user!.subscriptionPlan,
    },
    recommendations,
    notifications,
    badges,
    attempts,
  });
}
