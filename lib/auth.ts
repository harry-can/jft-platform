import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getCurrentUser as getSessionUser } from "@/lib/session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export async function getCurrentUser() {
  return getSessionUser();
}

export async function requireAdmin() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/student/dashboard");
  }

  return user;
}