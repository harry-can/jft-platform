
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacherOrAdmin } from "@/lib/roles";
import { UserRole } from "@/generated/prisma/client";

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
            include: {
              attempts: {
                where: {
                  status: {
                    in: ["SUBMITTED", "AUTO_SUBMITTED"],
                  },
                },
                include: {
                  practiceSet: true,
                },
                orderBy: {
                  startedAt: "desc",
                },
              },
              weaknessProfiles: {
                orderBy: {
                  accuracy: "asc",
                },
              },
            },
          },
        },
      },
      assignments: {
        include: {
          practiceSet: true,
        },
      },
    },
  });

  if (!classRoom) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const assignedSetIds = classRoom.assignments.map((a) => a.practiceSetId);

  const students = classRoom.members.map((member) => {
    const attempts = member.user.attempts.filter((attempt) =>
      assignedSetIds.length > 0 ? assignedSetIds.includes(attempt.practiceSetId) : true
    );

    const submittedAttempts = attempts.filter((a) => a.accuracy !== null);
    const totalAttempts = submittedAttempts.length;

    const avgAccuracy =
      totalAttempts > 0
        ? Number(
            (
              submittedAttempts.reduce(
                (sum, attempt) => sum + Number(attempt.accuracy || 0),
                0
              ) / totalAttempts
            ).toFixed(2)
          )
        : 0;

    const bestAccuracy =
      totalAttempts > 0
        ? Math.max(...submittedAttempts.map((a) => Number(a.accuracy || 0)))
        : 0;

    const weakest = member.user.weaknessProfiles[0] || null;

    return {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      isActive: member.user.isActive,
      totalAttempts,
      avgAccuracy,
      bestAccuracy,
      weakestCategory: weakest?.category || null,
      weakestAccuracy: weakest?.accuracy || null,
      latestAttempt: submittedAttempts[0] || null,
    };
  });

  const classAvg =
    students.length > 0
      ? Number(
          (
            students.reduce((sum, s) => sum + Number(s.avgAccuracy || 0), 0) /
            students.length
          ).toFixed(2)
        )
      : 0;

  const completedStudents = students.filter((s) => s.totalAttempts > 0).length;

  return NextResponse.json({
    classRoom: {
      id: classRoom.id,
      name: classRoom.name,
      description: classRoom.description,
      joinCode: classRoom.joinCode,
    },
    summary: {
      totalStudents: students.length,
      completedStudents,
      assignedSets: classRoom.assignments.length,
      classAvg,
    },
    assignments: classRoom.assignments,
    students,
  });
}
