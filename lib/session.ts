import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export const SESSION_COOKIE_NAME = "jft_session";

// ✅ CREATE SESSION (FIX YOUR ERROR)
export async function createSession(userId: string) {
  const token = randomUUID();

  const session = await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return session;
}

// ✅ GET CURRENT USER (YOUR EXISTING FUNCTION)
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: { id: session.id },
    });
    return null;
  }

  return session.user;
}

// ✅ LOGOUT (OPTIONAL BUT IMPORTANT)
export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return;

  await prisma.session.deleteMany({
    where: { token },
  });

  cookieStore.delete(SESSION_COOKIE_NAME);
}