
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/roles";
import {
  QuestionCategory,
  QuestionDifficulty,
  SetType,
} from "@/generated/prisma/client";
import { auditLog } from "@/lib/audit";

function parseNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseCategory(value: unknown) {
  if (!value || value === "NONE") return null;
  return value as QuestionCategory;
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { setId } = await params;

  const set = await prisma.practiceSet.findUnique({
    where: {
      id: setId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      questions: {
        orderBy: {
          orderIndex: "asc",
        },
      },
      attempts: {
        select: {
          id: true,
        },
      },
      assignments: true,
    },
  });

  if (!set) {
    return NextResponse.json({ error: "Practice set not found" }, { status: 404 });
  }

  return NextResponse.json(set);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { user, response } = await requireAdmin();
  if (response) return response;

  const { setId } = await params;
  const body = await req.json();

  const updated = await prisma.practiceSet.update({
    where: {
      id: setId,
    },
    data: {
      ...(typeof body.title === "string" ? { title: body.title.trim() } : {}),
      ...(typeof body.description === "string"
        ? { description: body.description || null }
        : {}),
      ...(body.type ? { type: body.type as SetType } : {}),
      ...(body.category !== undefined ? { category: parseCategory(body.category) } : {}),
      ...(body.difficulty
        ? { difficulty: body.difficulty as QuestionDifficulty }
        : {}),
      ...(typeof body.isPublished === "boolean"
        ? { isPublished: body.isPublished }
        : {}),
      ...(body.timeLimitMin !== undefined
        ? { timeLimitMin: parseNullableNumber(body.timeLimitMin) }
        : {}),
      ...(body.audioReplayLimit !== undefined
        ? { audioReplayLimit: parseNullableNumber(body.audioReplayLimit) }
        : {}),
      ...(body.accessLevel ? { accessLevel: body.accessLevel } : {}),
      ...(body.sectionConfig !== undefined
        ? { sectionConfig: body.sectionConfig || undefined }
        : {}),
    },
    include: {
      questions: {
        orderBy: {
          orderIndex: "asc",
        },
      },
    },
  });

  await auditLog({
    actorId: user!.id,
    action: "UPDATE",
    entityType: "PracticeSet",
    entityId: updated.id,
    message: `Updated practice set: ${updated.title}`,
    metadata: body,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { user, response } = await requireAdmin();
  if (response) return response;

  const { setId } = await params;

  const set = await prisma.practiceSet.findUnique({
    where: {
      id: setId,
    },
    include: {
      attempts: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!set) {
    return NextResponse.json({ error: "Practice set not found" }, { status: 404 });
  }

  if (set.attempts.length > 0) {
    return NextResponse.json(
      {
        error:
          "This set already has student attempts. Unpublish it instead of deleting.",
      },
      { status: 400 }
    );
  }

  await prisma.practiceSet.delete({
    where: {
      id: setId,
    },
  });

  await auditLog({
    actorId: user!.id,
    action: "DELETE",
    entityType: "PracticeSet",
    entityId: setId,
    message: `Deleted practice set: ${set.title}`,
  });

  return NextResponse.json({ success: true });
}
