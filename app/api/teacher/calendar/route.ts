
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacherOrAdmin } from "@/lib/roles";
import { UserRole } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const { user, response } = await requireTeacherOrAdmin();
  if (response) return response;

  const url = new URL(req.url);
  const classId = url.searchParams.get("classId") || "";
  const status = url.searchParams.get("status") || "ALL";

  const classWhere =
    user!.role === UserRole.ADMIN
      ? classId
        ? { id: classId }
        : {}
      : classId
      ? { id: classId, teacherId: user!.id }
      : { teacherId: user!.id };

  const classes = await prisma.classRoom.findMany({
    where: classWhere,
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
            },
          },
        },
      },
      assignments: {
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
                  accuracy: true,
                  submittedAt: true,
                  status: true,
                },
              },
              questions: {
                select: {
                  id: true,
                  isPublished: true,
                },
              },
            },
          },
        },
        orderBy: {
          dueDate: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const now = new Date();

  const assignments = classes.flatMap((classRoom) =>
    classRoom.assignments.map((assignment) => {
      const practiceSet = assignment.practiceSet;

      const completedUserIds = new Set(
        practiceSet.attempts.map((attempt) => attempt.userId)
      );

      const students = classRoom.members.map((member) => {
        const attempts = practiceSet.attempts.filter(
          (attempt) => attempt.userId === member.userId
        );

        const latestAttempt = attempts.sort((a, b) => {
          const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
          const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
          return bTime - aTime;
        })[0];

        return {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          isActive: member.user.isActive,
          completed: completedUserIds.has(member.userId),
          latestAttempt,
        };
      });

      const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
      const releaseAt = practiceSet.releaseAt ? new Date(practiceSet.releaseAt) : null;

      const completedCount = students.filter((student) => student.completed).length;
      const pendingCount = students.length - completedCount;

      const isReleased = !releaseAt || releaseAt <= now;
      const isUpcoming = !!dueDate && dueDate >= now;
      const isOverdue = !!dueDate && dueDate < now && pendingCount > 0;

      let computedStatus = "NO_DUE_DATE";

      if (!isReleased) computedStatus = "SCHEDULED";
      else if (isOverdue) computedStatus = "OVERDUE";
      else if (pendingCount === 0 && students.length > 0) computedStatus = "COMPLETED";
      else if (isUpcoming) computedStatus = "UPCOMING";
      else computedStatus = "ACTIVE";

      return {
        id: assignment.id,
        classRoom: {
          id: classRoom.id,
          name: classRoom.name,
          joinCode: classRoom.joinCode,
        },
        practiceSet: {
          id: practiceSet.id,
          title: practiceSet.title,
          description: practiceSet.description,
          type: practiceSet.type,
          category: practiceSet.category,
          difficulty: practiceSet.difficulty,
          isPublished: practiceSet.isPublished,
          releaseAt: practiceSet.releaseAt,
          timeLimitMin: practiceSet.timeLimitMin,
          questionCount: practiceSet.questions.filter((q) => q.isPublished).length,
        },
        dueDate: assignment.dueDate,
        createdAt: assignment.createdAt,
        status: computedStatus,
        summary: {
          totalStudents: students.length,
          completedCount,
          pendingCount,
        },
        students,
      };
    })
  );

  const filteredAssignments = assignments.filter((assignment) => {
    if (status === "ALL") return true;
    return assignment.status === status;
  });

  const summary = {
    totalClasses: classes.length,
    totalAssignments: assignments.length,
    scheduled: assignments.filter((a) => a.status === "SCHEDULED").length,
    upcoming: assignments.filter((a) => a.status === "UPCOMING").length,
    active: assignments.filter((a) => a.status === "ACTIVE").length,
    overdue: assignments.filter((a) => a.status === "OVERDUE").length,
    completed: assignments.filter((a) => a.status === "COMPLETED").length,
  };

  return NextResponse.json({
    summary,
    classes: classes.map((classRoom) => ({
      id: classRoom.id,
      name: classRoom.name,
      joinCode: classRoom.joinCode,
    })),
    assignments: filteredAssignments,
  });
}
