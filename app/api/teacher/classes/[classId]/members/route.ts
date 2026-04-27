
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

export async function POST(
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

  const email = String(body.email || "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Student email is required" }, { status: 400 });
  }

  const student = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!student) {
    return NextResponse.json(
      { error: "Student not found. Ask the student to register first." },
      { status: 404 }
    );
  }

  if (student.role !== UserRole.STUDENT) {
    return NextResponse.json(
      { error: "Only STUDENT users can be added to a class." },
      { status: 400 }
    );
  }

  const member = await prisma.classMember.upsert({
    where: {
      classRoomId_userId: {
        classRoomId: classId,
        userId: student.id,
      },
    },
    update: {},
    create: {
      classRoomId: classId,
      userId: student.id,
    },
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
  });

  await auditLog({
    actorId: user!.id,
    action: "UPDATE",
    entityType: "ClassRoom",
    entityId: classId,
    message: `Added student ${student.email} to class ${allowedClass.name}`,
  });

  return NextResponse.json(member);
}

export async function DELETE(
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

  const userId = String(body.userId || "");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  await prisma.classMember.delete({
    where: {
      classRoomId_userId: {
        classRoomId: classId,
        userId,
      },
    },
  });

  await auditLog({
    actorId: user!.id,
    action: "UPDATE",
    entityType: "ClassRoom",
    entityId: classId,
    message: `Removed student from class ${allowedClass.name}`,
    metadata: {
      userId,
    },
  });

  return NextResponse.json({ success: true });
}
