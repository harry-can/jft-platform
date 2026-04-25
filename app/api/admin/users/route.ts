import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { UserRole } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  const users = await prisma.user.findMany({
    where: role ? { role: role as UserRole } : {},
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      attempts: {
        select: {
          id: true,
          totalScore: true,
          accuracy: true,
          resultLabel: true,
          submittedAt: true,
        },
        orderBy: { startedAt: "desc" },
        take: 5,
      },
      weaknessProfiles: true,
      memberships: {
        include: {
          classRoom: true,
        },
      },
    },
  });

  return NextResponse.json(users);
}