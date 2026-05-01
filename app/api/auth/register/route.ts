import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { UserRole } from "@prisma/client";
export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 400 }
    );
  }

  // SAFE ROLE HANDLING
  const safeRole =
    role?.toLowerCase() === "teacher"
      ? UserRole.TEACHER
      : role?.toLowerCase() === "admin"
      ? UserRole.ADMIN
      : UserRole.STUDENT;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      role: safeRole,
    },
  });

  await createSession(user.id);

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}