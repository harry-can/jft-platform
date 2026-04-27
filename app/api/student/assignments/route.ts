
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/roles";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  const memberships = await prisma.classMember.findMany({
    where: {
      userId: user!.id,
    },
    include: {
      classRoom: {
        include: {
          assignments: {
            include: {
              practiceSet: {
                include: {
                  attempts: {
                    where: {
                      userId: user!.id,
                      status: {
                        in: ["SUBMITTED", "AUTO_SUBMITTED"],
                      },
                    },
                    orderBy: {
                      startedAt: "desc",
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
              createdAt: "desc",
            },
          },
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  const classes = memberships.map((membership) => {
    const classRoom = membership.classRoom;

    const assignments = classRoom.assignments.map((assignment) => {
      const practiceSet = assignment.practiceSet;
      const attempts = practiceSet.attempts || [];
      const latestAttempt = attempts[0] || null;

      const completed = attempts.length > 0;
      const now = new Date();
      const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
      const isOverdue = !!dueDate && !completed && dueDate < now;

      return {
        id: assignment.id,
        dueDate: assignment.dueDate,
        createdAt: assignment.createdAt,
        completed,
        isOverdue,
        latestAttempt,
        attemptsCount: attempts.length,
        practiceSet: {
          id: practiceSet.id,
          title: practiceSet.title,
          description: practiceSet.description,
          type: practiceSet.type,
          category: practiceSet.category,
          difficulty: practiceSet.difficulty,
          timeLimitMin: practiceSet.timeLimitMin,
          isPublished: practiceSet.isPublished,
          questionCount: practiceSet.questions.filter((q) => q.isPublished).length,
        },
      };
    });

    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter((a) => a.completed).length;
    const pendingAssignments = assignments.filter((a) => !a.completed).length;
    const overdueAssignments = assignments.filter((a) => a.isOverdue).length;

    return {
      id: classRoom.id,
      name: classRoom.name,
      description: classRoom.description,
      joinCode: classRoom.joinCode,
      joinedAt: membership.joinedAt,
      summary: {
        totalAssignments,
        completedAssignments,
        pendingAssignments,
        overdueAssignments,
      },
      assignments,
    };
  });

  const allAssignments = classes.flatMap((classRoom) =>
    classRoom.assignments.map((assignment) => ({
      ...assignment,
      classRoom: {
        id: classRoom.id,
        name: classRoom.name,
        joinCode: classRoom.joinCode,
      },
    }))
  );

  const summary = {
    classCount: classes.length,
    totalAssignments: allAssignments.length,
    completedAssignments: allAssignments.filter((a) => a.completed).length,
    pendingAssignments: allAssignments.filter((a) => !a.completed).length,
    overdueAssignments: allAssignments.filter((a) => a.isOverdue).length,
  };

  return NextResponse.json({
    summary,
    classes,
    assignments: allAssignments,
  });
}
