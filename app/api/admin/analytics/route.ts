import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/roles";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const totalUsers = await prisma.user.count();

  const totalStudents = await prisma.user.count({
    where: { role: "STUDENT" },
  });

  const totalQuestions = await prisma.question.count();
  const totalAttempts = await prisma.attempt.count();
  const totalCertificates = await prisma.certificate.count();

  const attempts = await prisma.attempt.findMany({
    where: {
      accuracy: {
        not: null,
      },
    },
    select: {
      accuracy: true,
      startedAt: true,
    },
    orderBy: {
      startedAt: "asc",
    },
  });

  const avgScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, attempt) => {
            return sum + (attempt.accuracy || 0);
          }, 0) / attempts.length
        )
      : 0;

  const progress = attempts.slice(-10).map((attempt, index) => ({
    name: `Attempt ${index + 1}`,
    score: Math.round(attempt.accuracy || 0),
    date: attempt.startedAt,
  }));

  return NextResponse.json({
    totalUsers,
    totalStudents,
    totalQuestions,
    totalAttempts,
    totalCertificates,
    avgScore,
    progress,
  });
}