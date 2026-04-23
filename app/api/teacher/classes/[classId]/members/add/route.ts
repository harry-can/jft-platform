import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.classMember.findFirst({
      where: {
        classRoomId: classId,
        userId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Student already in class" },
        { status: 400 }
      );
    }

    const member = await prisma.classMember.create({
      data: {
        classRoomId: classId,
        userId,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Add member error:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}