
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacherOrAdmin } from "@/lib/roles";
import { UserRole } from "@/generated/prisma/client";
import { auditLog } from "@/lib/audit";

async function canAccessClass(user: any, classId: string) {
  const classRoom = await prisma.classRoom.findUnique({
    where: {
      id: classId,
    },
  });

  if (!classRoom) return null;

  if (user.role === UserRole.ADMIN) return classRoom;
  if (classRoom.teacherId === user.id) return classRoom;

  return null;
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { user, response } = await requireTeacherOrAdmin();
  if (response) return response;

  const { classId } = await params;

  const allowedClass = await canAccessClass(user, classId);

  if (!allowedClass) {
    return NextResponse.json({ error: "Class not found or no access" }, { status: 404 });
  }

  const classRoom = await prisma.classRoom.findUnique({
    where: {
      id: classId,
    },
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
              createdAt: true,
            },
          },
        },
        orderBy: {
          joinedAt: "desc",
        },
      },
      assignments: {
        include: {
          practiceSet: {
            include: {
              questions: {
                select: {
                  id: true,
                  category: true,
                  isPublished: true,
                },
              },
              attempts: {
                select: {
                  id: true,
                  userId: true,
                  accuracy: true,
                  correctCount: true,
                  totalQuestions: true,
                  submittedAt: true,
                  status: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return NextResponse.json(classRoom);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { user, response } = await requireTeacherOrAdmin();
  if (response) return response;

  const { classId } = await params;
  const body = await req.json();

  const allowedClass = await canAccessClass(user, classId);

  if (!allowedClass) {
    return NextResponse.json({ error: "Class not found or no access" }, { status: 404 });
  }

  const updated = await prisma.classRoom.update({
    where: {
      id: classId,
    },
    data: {
      ...(typeof body.name === "string" ? { name: body.name.trim() } : {}),
      ...(typeof body.description === "string"
        ? { description: body.description || null }
        : {}),
      ...(typeof body.joinCode === "string"
        ? { joinCode: body.joinCode.trim().toUpperCase() }
        : {}),
    },
  });

  await auditLog({
    actorId: user!.id,
    action: "UPDATE",
    entityType: "ClassRoom",
    entityId: updated.id,
    message: `Updated class: ${updated.name}`,
    metadata: body,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { user, response } = await requireTeacherOrAdmin();
  if (response) return response;

  const { classId } = await params;

  const allowedClass = await canAccessClass(user, classId);

  if (!allowedClass) {
    return NextResponse.json({ error: "Class not found or no access" }, { status: 404 });
  }

  await prisma.classRoom.delete({
    where: {
      id: classId,
    },
  });

  await auditLog({
    actorId: user!.id,
    action: "DELETE",
    entityType: "ClassRoom",
    entityId: classId,
    message: `Deleted class: ${allowedClass.name}`,
  });

  return NextResponse.json({ success: true });
}
