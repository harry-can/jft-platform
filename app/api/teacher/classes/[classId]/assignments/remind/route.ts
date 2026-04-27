
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
  const message = String(body.message || "").trim();

  if (!practiceSetId) {
    return NextResponse.json({ error: "practiceSetId is required" }, { status: 400 });
  }

  const assignment = await prisma.assignment.findUnique({
    where: {
      classRoomId_practiceSetId: {
        classRoomId: classId,
        practiceSetId,
      },
    },
    include: {
      practiceSet: {
        include: {
          attempts: {
            where: {
              status: {
                in: ["SUBMITTED", "AUTO_SUBMITTED"],
              },
            },
            select: {
              id: true,
              userId: true,
            },
          },
        },
      },
      classRoom: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  const completedUserIds = new Set(
    assignment.practiceSet.attempts.map((attempt) => attempt.userId)
  );

  const pendingMembers = assignment.classRoom.members.filter(
    (member) => !completedUserIds.has(member.userId)
  );

  if (pendingMembers.length === 0) {
    return NextResponse.json({
      success: true,
      createdCount: 0,
      message: "All students have completed this assignment.",
    });
  }

  await prisma.notification.createMany({
    data: pendingMembers.map((member) => ({
      userId: member.userId,
      type: "ASSIGNMENT",
      title: "Assignment reminder",
      message:
        message ||
        `Reminder: Please complete ${assignment.practiceSet.title} for ${allowedClass.name}.`,
      href: `/test-engine?mode=SET&setId=${assignment.practiceSet.id}`,
    })),
  });

  await auditLog({
    actorId: user!.id,
    action: "CREATE",
    entityType: "Notification",
    entityId: assignment.id,
    message: `Sent assignment reminder for ${assignment.practiceSet.title}`,
    metadata: {
      classId,
      practiceSetId,
      pendingCount: pendingMembers.length,
    },
  });

  return NextResponse.json({
    success: true,
    createdCount: pendingMembers.length,
  });
}
