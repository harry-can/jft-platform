import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: {
        attempts: {
          orderBy: { startedAt: "desc" },
          take: 7,
          include: {
            practiceSet: true,
          },
        },
        weaknessProfiles: true,
        badges: true,
        certificates: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const progress = [...user.attempts].reverse().map((attempt, index) => ({
      name: `Test ${index + 1}`,
      score: Math.round(attempt.accuracy || 0),
    }));

    return NextResponse.json({
      id: user.id,
      name: user.name || "Student",
      email: user.email,
      imageUrl: user.avatarUrl || "/images/default-student.png",
      level: "N5",
      xp: user.xp,
      streak: user.streakDays,
      attempts: user.attempts,
      weaknesses: user.weaknessProfiles,
      badges: user.badges,
      certificates: user.certificates,
      progress,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}