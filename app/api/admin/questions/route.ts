
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/roles";
import {
  QuestionCategory,
  QuestionDifficulty,
} from "@/generated/prisma/client";
import { auditLog } from "@/lib/audit";

function parseOptions(value: unknown) {
  if (!value) return null;

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
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const url = new URL(req.url);
  const practiceSetId = url.searchParams.get("practiceSetId") || undefined;

  const questions = await prisma.question.findMany({
    where: practiceSetId
      ? {
          practiceSetId,
        }
      : undefined,
    include: {
      practiceSet: {
        select: {
          id: true,
          title: true,
          type: true,
          category: true,
        },
      },
      _count: {
        select: {
          answers: true,
          wrongItems: true,
        },
      },
    },
    orderBy: [
      {
        practiceSetId: "asc",
      },
      {
        orderIndex: "asc",
      },
    ],
  });

  return NextResponse.json(questions);
}

export async function POST(req: Request) {
  const { user, response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();

  const practiceSetId = String(body.practiceSetId || "");
  const text = String(body.text || "").trim();

  if (!practiceSetId) {
    return NextResponse.json({ error: "practiceSetId is required" }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: "Question text is required" }, { status: 400 });
  }

  const practiceSet = await prisma.practiceSet.findUnique({
    where: {
      id: practiceSetId,
    },
  });

  if (!practiceSet) {
    return NextResponse.json({ error: "Practice set not found" }, { status: 404 });
  }

  const created = await prisma.question.create({
    data: {
      practiceSetId,
      text,
      category: (body.category || "OTHER") as QuestionCategory,
      difficulty: (body.difficulty || "MEDIUM") as QuestionDifficulty,
      type: body.type ? String(body.type) : "mcq",
      options: parseOptions(body.options) as any,
      answer: body.answer ? String(body.answer) : null,
      imageUrl: body.imageUrl ? String(body.imageUrl) : null,
      audioUrl: body.audioUrl ? String(body.audioUrl) : null,
      transcript: body.transcript ? String(body.transcript) : null,
      replayLimit: parseNullableNumber(body.replayLimit),
      explanation: body.explanation ? String(body.explanation) : null,
      tags: parseTags(body.tags),
      points: Number(body.points || 1),
      orderIndex: Number(body.orderIndex || 0),
      isPublished:
        typeof body.isPublished === "boolean" ? body.isPublished : true,
      grammarPoint: body.grammarPoint ? String(body.grammarPoint) : null,
      kanjiTarget: body.kanjiTarget ? String(body.kanjiTarget) : null,
      accessLevel: body.accessLevel || "FREE",
    },
  });

  await auditLog({
    actorId: user!.id,
    action: "CREATE",
    entityType: "Question",
    entityId: created.id,
    message: `Created question in set: ${practiceSet.title}`,
    metadata: {
      practiceSetId,
      category: created.category,
      difficulty: created.difficulty,
    },
  });

  return NextResponse.json(created);
}
