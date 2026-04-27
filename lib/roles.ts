
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { UserRole } from "@/generated/prisma/client";

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Not logged in" }, { status: 401 }),
    };
  }

  if (!user.isActive) {
    return {
      user: null,
      response: NextResponse.json({ error: "Account disabled" }, { status: 403 }),
    };
  }

  return { user, response: null };
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== UserRole.ADMIN) {
    return {
      user: null,
      response: NextResponse.json({ error: "Admin only" }, { status: 403 }),
    };
  }

  return { user, response: null };
}

export async function requireTeacherOrAdmin() {
  const user = await getCurrentUser();

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.TEACHER)) {
    return {
      user: null,
      response: NextResponse.json({ error: "Teacher or admin only" }, { status: 403 }),
    };
  }

  return { user, response: null };
}
