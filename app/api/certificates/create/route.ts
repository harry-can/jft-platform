import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId } = await req.json();

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        practiceSet: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if ((attempt.accuracy || 0) < 80) {
      return NextResponse.json(
        { error: "Certificate requires minimum 80% score" },
        { status: 400 }
      );
    }

    const certificate = await prisma.certificate.create({
      data: {
        userId: currentUser.id,
        attemptId: attempt.id,
        title: `${attempt.practiceSet.title} Certificate`,
        score: attempt.accuracy || 0,
        verificationCode: uuid(),
      },
    });

    return NextResponse.json({
      success: true,
      certificate,
    });
  } catch (error) {
    console.error("Certificate error:", error);
    return NextResponse.json(
      { error: "Failed to create certificate" },
      { status: 500 }
    );
  }
}