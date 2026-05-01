import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, teacherId } = body;

    if (!name || !teacherId) {
      return NextResponse.json(
        { error: "name and teacherId are required" },
        { status: 400 }
      );
    }

   const classRoom = await prisma.classRoom.create({
  data: {
    name,
    teacherId,
    joinCode: Math.random().toString(36).substring(2, 8), // generate code
  },
});

    return NextResponse.json(classRoom);
  } catch (error) {
    console.error("Create class error:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}