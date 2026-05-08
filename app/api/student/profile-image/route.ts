import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "students");
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${uuid()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const avatarUrl = `/uploads/students/${fileName}`;

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { avatarUrl },
    });

    return NextResponse.json({
      success: true,
      avatarUrl,
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload profile image" },
      { status: 500 }
    );
  }
}