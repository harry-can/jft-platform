
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createRequire } from "module";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/roles";
import {
  QuestionCategory,
  QuestionDifficulty,
  SetType,
} from "@/generated/prisma/client";
import { auditLog } from "@/lib/audit";

const require = createRequire(import.meta.url);

type GeneratedQuestion = {
  text: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  type: string;
  options: Record<string, string>;
  answer: string;
  explanation?: string;
  tags?: string[];
};

type GeneratedSet = {
  title: string;
  description?: string;
  type: SetType;
  category?: QuestionCategory | null;
  difficulty?: QuestionDifficulty;
  timeLimitMin?: number | null;
  questions: GeneratedQuestion[];
};

const validCategories = [
  "VOCAB",
  "GRAMMAR",
  "READING",
  "LISTENING",
  "KANJI",
  "INFO",
  "SPEAKING",
  "OTHER",
];

const validDifficulties = ["EASY", "MEDIUM", "HARD", "OFFICIAL"];
const validSetTypes = [
  "CATEGORY_PRACTICE",
  "FULL_PRACTICE",
  "WRONG_RETRY",
  "OFFICIAL_EXAM",
];

function extractJson(text: string) {
  const cleaned = text
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("AI response did not contain JSON.");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

function normalizeGeneratedSet(raw: any): GeneratedSet {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid AI JSON.");
  }

  const type = validSetTypes.includes(raw.type)
    ? raw.type
    : "CATEGORY_PRACTICE";

  const category =
    raw.category && validCategories.includes(raw.category)
      ? raw.category
      : type === "CATEGORY_PRACTICE"
      ? "GRAMMAR"
      : null;

  const difficulty = validDifficulties.includes(raw.difficulty)
    ? raw.difficulty
    : type === "OFFICIAL_EXAM"
    ? "OFFICIAL"
    : "MEDIUM";

  const questions = Array.isArray(raw.questions) ? raw.questions : [];

  const normalizedQuestions = questions
    .map((q: any, index: number) => {
      const qCategory = validCategories.includes(q.category)
        ? q.category
        : category || "OTHER";

      const qDifficulty = validDifficulties.includes(q.difficulty)
        ? q.difficulty
        : difficulty;

      const options =
        q.options && typeof q.options === "object"
          ? q.options
          : {
              A: "",
              B: "",
              C: "",
              D: "",
            };

      const answer = ["A", "B", "C", "D"].includes(q.answer)
        ? q.answer
        : "A";

      return {
        text: String(q.text || `Question ${index + 1}`),
        category: qCategory,
        difficulty: qDifficulty,
        type: String(q.type || "mcq"),
        options,
        answer,
        explanation: q.explanation ? String(q.explanation) : "",
        tags: Array.isArray(q.tags) ? q.tags.map(String) : ["N4", "AI_GENERATED"],
      };
    })
    .filter((q: GeneratedQuestion) => q.text.trim().length > 0);

  if (normalizedQuestions.length === 0) {
    throw new Error("AI generated zero valid questions.");
  }

  return {
    title: String(raw.title || "AI Generated N4 Practice Set"),
    description: raw.description ? String(raw.description) : "AI generated draft set.",
    type,
    category,
    difficulty,
    timeLimitMin:
      typeof raw.timeLimitMin === "number" ? raw.timeLimitMin : type === "OFFICIAL_EXAM" ? 60 : 20,
    questions: normalizedQuestions,
  };
}

export async function POST(req: Request) {
  const { user, response } = await requireAdmin();
  if (response) return response;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is missing in .env" },
      { status: 500 }
    );
  }

  const formData = await req.formData();

  const prompt = String(formData.get("prompt") || "");
  const file = formData.get("file") as File | null;

  let sourceText = prompt;

  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
  const pdfParse = require("pdf-parse");
  const parsed = await pdfParse(buffer);
  sourceText += "\n\nPDF CONTENT:\n" + parsed.text;
} else {
  sourceText += "\n\nFILE CONTENT:\n" + buffer.toString("utf8");
}
  }

  if (!sourceText.trim()) {
    return NextResponse.json({ error: "Prompt or file is required" }, { status: 400 });
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const aiPrompt = `
Create a JFT/JLPT N4 practice set.

Return ONLY valid JSON. No markdown.

JSON shape:
{
  "title": "string",
  "description": "string",
  "type": "CATEGORY_PRACTICE" | "FULL_PRACTICE" | "OFFICIAL_EXAM",
  "category": "VOCAB" | "GRAMMAR" | "READING" | "LISTENING" | "KANJI" | "INFO" | "SPEAKING" | "OTHER" | null,
  "difficulty": "EASY" | "MEDIUM" | "HARD" | "OFFICIAL",
  "timeLimitMin": number,
  "questions": [
    {
      "text": "question text",
      "category": "VOCAB" | "GRAMMAR" | "READING" | "LISTENING" | "KANJI" | "INFO" | "SPEAKING" | "OTHER",
      "difficulty": "EASY" | "MEDIUM" | "HARD" | "OFFICIAL",
      "type": "mcq",
      "options": { "A": "option A", "B": "option B", "C": "option C", "D": "option D" },
      "answer": "A",
      "explanation": "short explanation",
      "tags": ["N4"]
    }
  ]
}

Rules:
- Make N4-level Japanese learning questions.
- Each question must have options A, B, C, D.
- answer must be one of A, B, C, D.
- Include explanation for every question.
- If the prompt asks for official exam, use OFFICIAL_EXAM and mixed categories.
- If the prompt asks category practice, use CATEGORY_PRACTICE.
- Save no markdown, no comments, only JSON.

SOURCE:
${sourceText}
`;

  try {
    const result = await client.responses.create({
      model: process.env.AI_MODEL || "gpt-5.5",
      input: aiPrompt,
    });

    const jsonText = extractJson(result.output_text);
    const parsed = JSON.parse(jsonText);
    const generated = normalizeGeneratedSet(parsed);

    const createdSet = await prisma.practiceSet.create({
      data: {
        title: generated.title,
        description: generated.description || null,
        type: generated.type,
        category: generated.category || null,
        difficulty: generated.difficulty || "MEDIUM",
        timeLimitMin: generated.timeLimitMin || null,
        isPublished: false,
        createdById: user!.id,
        questions: {
          create: generated.questions.map((q, index) => ({
            text: q.text,
            category: q.category,
            difficulty: q.difficulty || "MEDIUM",
            type: q.type || "mcq",
            options: q.options,
            answer: q.answer,
            explanation: q.explanation || null,
            tags: q.tags || ["N4", "AI_GENERATED"],
            orderIndex: index + 1,
            isPublished: false,
          })),
        },
      },
      include: {
        questions: {
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    await prisma.generatorJob.create({
      data: {
        userId: user!.id,
        sourceType: file ? "PDF_OR_FILE" : "PROMPT",
        prompt,
        status: "COMPLETED",
        outputJson: generated as any,
      },
    });

    await auditLog({
      actorId: user!.id,
      action: "IMPORT",
      entityType: "PracticeSet",
      entityId: createdSet.id,
      message: `AI generated draft practice set: ${createdSet.title}`,
      metadata: {
        questionCount: createdSet.questions.length,
        sourceType: file ? "PDF_OR_FILE" : "PROMPT",
      },
    });

    return NextResponse.json({
      success: true,
      practiceSet: createdSet,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI import failed";

    await prisma.generatorJob.create({
      data: {
        userId: user!.id,
        sourceType: file ? "PDF_OR_FILE" : "PROMPT",
        prompt,
        status: "FAILED",
        error: message,
      },
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
