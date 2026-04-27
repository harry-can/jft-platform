
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

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const sets = await prisma.practiceSet.findMany({
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      questions: {
        select: {
          id: true,
          category: true,
          difficulty: true,
          isPublished: true,
        },
        orderBy: {
          orderIndex: "asc",
        },
      },
      attempts: {
        select: {
          id: true,
        },
      },
      assignments: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(sets);
}

export async function POST(req: Request) {
  const { user, response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();

  const title = String(body.title || "").trim();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const set = await prisma.practiceSet.create({
    data: {
      title,
      description: body.description ? String(body.description) : null,
      type: (body.type || SetType.CATEGORY_PRACTICE) as SetType,
      category: parseCategory(body.category),
      difficulty: body.difficulty
        ? (body.difficulty as QuestionDifficulty)
        : QuestionDifficulty.MEDIUM,
      isPublished: Boolean(body.isPublished),
      timeLimitMin: parseNullableNumber(body.timeLimitMin),
      audioReplayLimit: parseNullableNumber(body.audioReplayLimit),
      accessLevel: body.accessLevel || "FREE",
      sectionConfig: body.sectionConfig || undefined,
      createdById: user!.id,
    },
    include: {
      questions: true,
    },
  });

  await auditLog({
    actorId: user!.id,
    action: "CREATE",
    entityType: "PracticeSet",
    entityId: set.id,
    message: `Created practice set: ${set.title}`,
    metadata: {
      type: set.type,
      category: set.category,
      difficulty: set.difficulty,
    },
  });

  return NextResponse.json(set);
}
