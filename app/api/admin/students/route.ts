import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  await requireAdmin();

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
    },
    include: {
      attempts: true,
      certificates: true,
      weaknessProfiles: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ students });
}