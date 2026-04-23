import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const exams = await prisma.exam.findMany({
    orderBy: {
      title: "asc",
    },
  });

  return NextResponse.json(exams);
}