import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadDir = path.join(process.cwd(), "public", "audio");
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() || "mp3";
    const fileName = `${uuid()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      audioUrl: `/audio/${fileName}`,
    });
  } catch (error) {
    console.error("Audio upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload audio" },
      { status: 500 }
    );
  }
}