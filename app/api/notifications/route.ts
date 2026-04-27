
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/roles";

export async function GET(req: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get("unreadOnly") === "true";

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user!.id,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId: user!.id,
      isRead: false,
    },
  });

  return NextResponse.json({
    unreadCount,
    notifications,
  });
}

export async function PATCH(req: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body = await req.json().catch(() => ({}));
  const id = body.id ? String(body.id) : "";
  const action = String(body.action || "READ");

  if (action === "READ_ALL") {
    await prisma.notification.updateMany({
      where: {
        userId: user!.id,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  }

  if (action === "UNREAD_ALL") {
    await prisma.notification.updateMany({
      where: {
        userId: user!.id,
      },
      data: {
        isRead: false,
      },
    });

    return NextResponse.json({ success: true });
  }

  if (!id) {
    return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
  }

  const updated = await prisma.notification.updateMany({
    where: {
      id,
      userId: user!.id,
    },
    data: {
      isRead: action === "UNREAD" ? false : true,
    },
  });

  return NextResponse.json({
    success: true,
    updated,
  });
}

export async function DELETE(req: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body = await req.json().catch(() => ({}));
  const id = body.id ? String(body.id) : "";

  if (id) {
    await prisma.notification.deleteMany({
      where: {
        id,
        userId: user!.id,
      },
    });

    return NextResponse.json({ success: true });
  }

  await prisma.notification.deleteMany({
    where: {
      userId: user!.id,
      isRead: true,
    },
  });

  return NextResponse.json({ success: true });
}
