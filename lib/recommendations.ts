
import { prisma } from "@/lib/prisma";

export async function getStudentRecommendations(userId: string) {
  const weaknessProfiles = await prisma.weaknessProfile.findMany({
    where: { userId },
    orderBy: { accuracy: "asc" },
  });

  const attempts = await prisma.attempt.findMany({
    where: {
      userId,
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
    take: 10,
  });

  const pendingWrongRetry = await prisma.wrongRetrySet.findMany({
    where: {
      userId,
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
  });

  const weakest = weaknessProfiles[0] || null;
  const latestAttempt = attempts[0] || null;

  let readinessScore = 0;

  if (attempts.length > 0) {
    readinessScore =
      attempts.reduce((sum, a) => sum + Number(a.accuracy || 0), 0) / attempts.length;
  }

  let readinessLabel = "Not Ready";

  if (readinessScore >= 90) readinessLabel = "Exam Ready";
  else if (readinessScore >= 75) readinessLabel = "Ready";
  else if (readinessScore >= 50) readinessLabel = "Almost Ready";

  const recommendations = [];

  if (pendingWrongRetry.length > 0) {
    recommendations.push({
      priority: 1,
      title: "Finish wrong-question practice",
      message: "You have unresolved wrong questions. Solve them before taking a new mock test.",
      href: `/wrong-retry/${pendingWrongRetry[0].id}`,
      action: "Practice wrong questions",
    });
  }

  if (weakest) {
    recommendations.push({
      priority: 2,
      title: `Improve ${weakest.category}`,
      message: `${weakest.category} is your weakest area with ${Number(
        weakest.accuracy
      ).toFixed(1)}% accuracy.`,
      href: `/practice?category=${weakest.category}`,
      action: `Practice ${weakest.category}`,
    });
  }

  if (!latestAttempt || Number(latestAttempt.accuracy || 0) >= 75) {
    recommendations.push({
      priority: 3,
      title: "Take a full mock test",
      message: "Take a full official-style test to check readiness.",
      href: "/exams",
      action: "Start mock test",
    });
  }

  if (attempts.length === 0) {
    recommendations.push({
      priority: 1,
      title: "Start with learning",
      message: "Complete N4 lessons before your first practice test.",
      href: "/learn",
      action: "Start learning",
    });
  }

  return {
    weakest,
    latestAttempt,
    pendingWrongRetry,
    readinessScore: Number(readinessScore.toFixed(2)),
    readinessLabel,
    recommendations,
  };
}
