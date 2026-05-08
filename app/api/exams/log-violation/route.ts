import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId, eventType, message } = body;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

    const newViolationCount = (attempt.violations || 0) + 1;

    const shouldLock = newViolationCount >= 3;

    const updatedAttempt = await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        violations: newViolationCount,
        status: shouldLock ? "LOCKED" : attempt.status,
        lockedReason: shouldLock
          ? "Exam locked because student made 3 secure exam violations."
          : attempt.lockedReason,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "LOGIN",
        entityType: "Attempt",
        entityId: attemptId,
        message: message || eventType || "Exam violation detected",
        metadata: {
          attemptId,
          eventType,
          violationCount: newViolationCount,
          locked: shouldLock,
          actionType: shouldLock ? "EXAM_LOCKED" : "EXAM_VIOLATION",
        },
      },
    });

    return NextResponse.json({
      locked: shouldLock,
      violations: updatedAttempt.violations,
      message: shouldLock
        ? "Exam locked after 3 violations."
        : "Violation logged.",
    });
  } catch (error) {
    console.error("Log violation error:", error);

    return NextResponse.json(
      { error: "Failed to log violation" },
      { status: 500 }
    );
  }
}