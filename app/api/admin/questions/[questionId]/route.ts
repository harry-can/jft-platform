
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/roles";
import {
  QuestionCategory,
  QuestionDifficulty,
} from "@/generated/prisma/client";
import { auditLog } from "@/lib/audit";

function parseOptions(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  return value;
}

function parseTags(value: unknown) {
  if (value === undefined) return undefined;

  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function parseNullableNumber(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { user, response } = await requireAdmin();
  if (response) return response;

  const { questionId } = await params;
  const body = await req.json();

  const options = parseOptions(body.options);
  const tags = parseTags(body.tags);
  const replayLimit = parseNullableNumber(body.replayLimit);

  const updated = await prisma.question.update({
    where: {
      id: questionId,
    },
    data: {
      ...(typeof body.text === "string" ? { text: body.text.trim() } : {}),
      ...(body.category ? { category: body.category as QuestionCategory } : {}),
      ...(body.difficulty
        ? { difficulty: body.difficulty as QuestionDifficulty }
        : {}),
      ...(typeof body.type === "string" ? { type: body.type } : {}),
      ...(options !== undefined ? { options: options as any } : {}),
      ...(body.answer !== undefined ? { answer: body.answer || null } : {}),
      ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl || null } : {}),
      ...(body.audioUrl !== undefined ? { audioUrl: body.audioUrl || null } : {}),
      ...(body.transcript !== undefined
        ? { transcript: body.transcript || null }
        : {}),
      ...(replayLimit !== undefined ? { replayLimit } : {}),
      ...(body.explanation !== undefined
        ? { explanation: body.explanation || null }
        : {}),
      ...(tags !== undefined ? { tags } : {}),
      ...(body.points !== undefined ? { points: Number(body.points || 1) } : {}),
      ...(body.orderIndex !== undefined
        ? { orderIndex: Number(body.orderIndex || 0) }
        : {}),
      ...(typeof body.isPublished === "boolean"
        ? { isPublished: body.isPublished }
        : {}),
      ...(body.grammarPoint !== undefined
        ? { grammarPoint: body.grammarPoint || null }
        : {}),
      ...(body.kanjiTarget !== undefined
        ? { kanjiTarget: body.kanjiTarget || null }
        : {}),
      ...(body.accessLevel ? { accessLevel: body.accessLevel } : {}),
    },
  });

  await auditLog({
    actorId: user!.id,
    action: "UPDATE",
    entityType: "Question",
    entityId: updated.id,
    message: `Updated question: ${updated.text.slice(0, 80)}`,
    metadata: body,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { user, response } = await requireAdmin();
  if (response) return response;

  const { questionId } = await params;

  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
    include: {
      answers: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  if (question.answers.length > 0) {
    await prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        isPublished: false,
      },
    });

    return NextResponse.json({
      success: true,
      unpublished: true,
      message:
        "Question has student answers, so it was unpublished instead of deleted.",
    });
  }

  await prisma.question.delete({
    where: {
      id: questionId,
    },
  });

  await auditLog({
    actorId: user!.id,
    action: "DELETE",
    entityType: "Question",
    entityId: questionId,
    message: `Deleted question: ${question.text.slice(0, 80)}`,
  });

  return NextResponse.json({ success: true });
}
