
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacherOrAdmin } from "@/lib/roles";
import { UserRole } from "@/generated/prisma/client";
import { auditLog } from "@/lib/audit";

function makeJoinCode() {
  return "JFT" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function GET() {
  const { user, response } = await requireTeacherOrAdmin();
  if (response) return response;

  const where =
    user!.role === UserRole.ADMIN
      ? {}
      : {
          teacherId: user!.id,
        };

  const classes = await prisma.classRoom.findMany({
    where,
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      },
      assignments: {
        include: {
          practiceSet: {
            select: {
              id: true,
              title: true,
              type: true,
              category: true,
              difficulty: true,
              isPublished: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  const { user, response } = await requireTeacherOrAdmin();
  if (response) return response;

  const body = await req.json();

  const name = String(body.name || "").trim();
  const description = body.description ? String(body.description) : null;

  if (!name) {
    return NextResponse.json({ error: "Class name is required" }, { status: 400 });
  }

  let joinCode = String(body.joinCode || "").trim().toUpperCase();

  if (!joinCode) {
    joinCode = makeJoinCode();
  }

  const existing = await prisma.classRoom.findUnique({
    where: {
      joinCode,
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Join code already exists. Use another code." },
      { status: 400 }
    );
  }

  const classRoom = await prisma.classRoom.create({
    data: {
      name,
      description,
      teacherId: user!.id,
      joinCode,
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      assignments: {
        include: {
          practiceSet: true,
        },
      },
    },
  });

  await auditLog({
    actorId: user!.id,
    action: "CREATE",
    entityType: "ClassRoom",
    entityId: classRoom.id,
    message: `Created class: ${classRoom.name}`,
  });

  return NextResponse.json(classRoom);
}
