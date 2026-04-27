
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

  const practiceSetId = String(body.practiceSetId || "");

  if (!practiceSetId) {
    return NextResponse.json({ error: "practiceSetId is required" }, { status: 400 });
  }

  const practiceSet = await prisma.practiceSet.findUnique({
    where: {
      id: practiceSetId,
    },
  });

  if (!practiceSet) {
    return NextResponse.json({ error: "Practice set not found" }, { status: 404 });
  }

  const dueDate = body.dueDate ? new Date(body.dueDate) : null;
  const releaseAt = body.releaseAt ? new Date(body.releaseAt) : null;

  if (releaseAt) {
    await prisma.practiceSet.update({
      where: {
        id: practiceSetId,
      },
      data: {
        releaseAt,
      },
    });
  }

  const assignment = await prisma.assignment.upsert({
    where: {
      classRoomId_practiceSetId: {
        classRoomId: classId,
        practiceSetId,
      },
    },
    update: {
      dueDate,
    },
    create: {
      classRoomId: classId,
      practiceSetId,
      dueDate,
    },
    include: {
      practiceSet: true,
    },
  });

  const members = await prisma.classMember.findMany({
    where: {
      classRoomId: classId,
    },
  });

  if (members.length > 0) {
    await prisma.notification.createMany({
      data: members.map((member) => ({
        userId: member.userId,
        type: "ASSIGNMENT",
        title: releaseAt ? "New scheduled assignment" : "New class assignment",
        message: releaseAt
          ? `${practiceSet.title} has been scheduled for your class.`
          : `${practiceSet.title} has been assigned to your class.`,
        href: `/student/assignments`,
      })),
    });
  }

  await auditLog({
    actorId: user!.id,
    action: "CREATE",
    entityType: "Assignment",
    entityId: assignment.id,
    message: `Assigned ${practiceSet.title} to class ${allowedClass.name}`,
    metadata: {
      classId,
      practiceSetId,
      releaseAt,
      dueDate,
    },
  });

  return NextResponse.json(assignment);
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

  const practiceSetId = String(body.practiceSetId || "");

  if (!practiceSetId) {
    return NextResponse.json({ error: "practiceSetId is required" }, { status: 400 });
  }

  await prisma.assignment.delete({
    where: {
      classRoomId_practiceSetId: {
        classRoomId: classId,
        practiceSetId,
      },
    },
  });

  await auditLog({
    actorId: user!.id,
    action: "DELETE",
    entityType: "Assignment",
    entityId: practiceSetId,
    message: `Removed assignment from class ${allowedClass.name}`,
    metadata: {
      classId,
      practiceSetId,
    },
  });

  return NextResponse.json({ success: true });
}
