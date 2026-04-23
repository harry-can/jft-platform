import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type AttemptItem = {
  totalScore: number | null;
  startedAt: Date;
  resultLabel: string | null;
};

type WeaknessItem = {
  id: string;
  category: string;
  accuracy: number;
  weaknessLevel: string | null;
};

type MemberItem = {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    attempts: AttemptItem[];
    weaknessProfiles: WeaknessItem[];
  };
};

export async function GET(
  _: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;

  const members = await prisma.classMember.findMany({
    where: { classRoomId: classId },
    include: {
      user: {
        include: {
          attempts: {
            orderBy: { startedAt: "desc" },
            take: 10,
          },
          weaknessProfiles: true,
        },
      },
    },
  });

  const formatted = (members as MemberItem[]).map((member: MemberItem) => {
    const attempts = member.user.attempts;
    const latestAttempt = attempts[0] || null;

    const avgScore =
      attempts.length > 0
        ? attempts.reduce(
            (sum: number, a: AttemptItem) => sum + (a.totalScore || 0),
            0
          ) / attempts.length
        : 0;

    return {
      id: member.id,
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.user.role,
      },
      latestAttempt,
      attemptsCount: attempts.length,
      averageScore: Number(avgScore.toFixed(2)),
      weaknesses: member.user.weaknessProfiles,
    };
  });

  return NextResponse.json(formatted);
}