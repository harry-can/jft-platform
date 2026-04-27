
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Assignment = {
  id: string;
  dueDate: string | null;
  createdAt: string;
  completed: boolean;
  isOverdue: boolean;
  attemptsCount: number;
  latestAttempt: {
    id: string;
    accuracy: number | null;
    correctCount: number | null;
    totalQuestions: number | null;
    resultLabel: string | null;
    submittedAt: string | null;
  } | null;
  practiceSet: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    category: string | null;
    difficulty: string | null;
    timeLimitMin: number | null;
    isPublished: boolean;
    questionCount: number;
  };
  classRoom: {
    id: string;
    name: string;
    joinCode: string;
  };
};

type ClassRoom = {
  id: string;
  name: string;
  description: string | null;
  joinCode: string;
  joinedAt: string;
  summary: {
    totalAssignments: number;
    completedAssignments: number;
    pendingAssignments: number;
    overdueAssignments: number;
  };
  assignments: Assignment[];
};

type AssignmentsData = {
  summary: {
    classCount: number;
    totalAssignments: number;
    completedAssignments: number;
    pendingAssignments: number;
    overdueAssignments: number;
  };
  classes: ClassRoom[];
  assignments: Assignment[];
};

export default function StudentAssignmentsPage() {
  const [data, setData] = useState<AssignmentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/student/assignments")
      .then(async (res) => {
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to load assignments");
        }

        setData(json);
      })
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredAssignments = useMemo(() => {
    if (!data) return [];

    if (filter === "PENDING") {
      return data.assignments.filter((a) => !a.completed);
    }

    if (filter === "COMPLETED") {
      return data.assignments.filter((a) => a.completed);
    }

    if (filter === "OVERDUE") {
      return data.assignments.filter((a) => a.isOverdue);
    }

    return data.assignments;
  }, [data, filter]);

  if (loading) {
    return <div className="p-6">Loading assignments...</div>;
  }

  if (!data) {
    return <div className="p-6">No assignments found.</div>;
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow">
          <p className="font-bold text-blue-700">Student Assignments</p>
          <h1 className="mt-2 text-4xl font-black">My Class Work</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            View assigned practice sets, due dates, completion status, and your latest score.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/student/home"
              className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
            >
              Smart Home
            </Link>

            <Link
  href="/notifications"
  className="rounded-2xl border bg-white px-5 py-3 font-bold"
>
  Notifications
</Link>

            <Link
              href="/practice"
              className="rounded-2xl border bg-white px-5 py-3 font-bold"
            >
              Practice Center
            </Link>

            <Link
              href="/student/report"
              className="rounded-2xl border bg-white px-5 py-3 font-bold"
            >
              My Report
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-5">
          <Card title="Classes" value={data.summary.classCount} />
          <Card title="Total" value={data.summary.totalAssignments} />
          <Card title="Completed" value={data.summary.completedAssignments} />
          <Card title="Pending" value={data.summary.pendingAssignments} />
          <Card title="Overdue" value={data.summary.overdueAssignments} />
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Assignments</h2>
              <p className="mt-1 text-slate-500">
                Filter and start your assigned work.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {["ALL", "PENDING", "COMPLETED", "OVERDUE"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-xl px-4 py-2 font-bold ${
                    filter === item
                      ? "bg-black text-white"
                      : "border bg-white text-slate-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}

            {filteredAssignments.length === 0 && (
              <div className="rounded-3xl border p-8 text-center">
                <h3 className="text-2xl font-black">No assignments here</h3>
                <p className="mt-2 text-slate-500">
                  Try another filter or ask your teacher to assign a practice set.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow">
          <h2 className="text-2xl font-black">My Classes</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {data.classes.map((classRoom) => (
              <div key={classRoom.id} className="rounded-3xl border p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black">{classRoom.name}</h3>
                    <p className="mt-2 text-slate-600">{classRoom.description}</p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                    {classRoom.joinCode}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-4 gap-2 text-center text-sm">
                  <MiniStat title="Total" value={classRoom.summary.totalAssignments} />
                  <MiniStat title="Done" value={classRoom.summary.completedAssignments} />
                  <MiniStat title="Pending" value={classRoom.summary.pendingAssignments} />
                  <MiniStat title="Overdue" value={classRoom.summary.overdueAssignments} />
                </div>
              </div>
            ))}

            {data.classes.length === 0 && (
              <div className="rounded-3xl border p-8 text-center md:col-span-2">
                <h3 className="text-2xl font-black">You have not joined any class</h3>
                <p className="mt-2 text-slate-500">
                  Join a class from the Classes page using your teacher's join code.
                </p>

                <Link
                  href="/classes"
                  className="mt-5 inline-block rounded-2xl bg-black px-5 py-3 font-bold text-white"
                >
                  Join Class
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const status = assignment.completed
    ? "COMPLETED"
    : assignment.isOverdue
    ? "OVERDUE"
    : "PENDING";

  const statusClass =
    status === "COMPLETED"
      ? "bg-green-100 text-green-700"
      : status === "OVERDUE"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  const latest = assignment.latestAttempt;

  return (
    <div className="rounded-[2rem] border p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass}`}>
              {status}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {assignment.classRoom.name}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {assignment.practiceSet.type}
            </span>

            {assignment.practiceSet.category && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {assignment.practiceSet.category}
              </span>
            )}
          </div>

          <h3 className="mt-4 text-2xl font-black">{assignment.practiceSet.title}</h3>

          <p className="mt-2 text-slate-600">
            {assignment.practiceSet.description || "No description"}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="rounded-xl bg-slate-100 px-3 py-2">
              {assignment.practiceSet.questionCount} questions
            </span>

            {assignment.practiceSet.timeLimitMin && (
              <span className="rounded-xl bg-slate-100 px-3 py-2">
                {assignment.practiceSet.timeLimitMin} minutes
              </span>
            )}

            {assignment.dueDate && (
              <span
                className={`rounded-xl px-3 py-2 ${
                  assignment.isOverdue
                    ? "bg-red-50 text-red-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            )}

            <span className="rounded-xl bg-slate-100 px-3 py-2">
              Attempts: {assignment.attemptsCount}
            </span>
          </div>

          {latest && (
            <div className="mt-4 rounded-2xl bg-blue-50 p-4">
              <div className="font-black text-blue-900">Latest Score</div>
              <div className="mt-1 text-sm text-blue-800">
                {Number(latest.accuracy || 0).toFixed(1)}% —{" "}
                {latest.correctCount || 0}/{latest.totalQuestions || 0} correct —{" "}
                {latest.resultLabel || "Result"}
              </div>

              {latest.submittedAt && (
                <div className="mt-1 text-xs text-blue-700">
                  Submitted: {new Date(latest.submittedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 lg:min-w-[240px] lg:justify-end">
          <Link
            href={`/test-engine?mode=SET&setId=${assignment.practiceSet.id}`}
            className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
          >
            {assignment.completed ? "Retake" : "Start"}
          </Link>

          {latest && (
            <Link
              href={`/results/${latest.id}`}
              className="rounded-2xl border bg-white px-5 py-3 font-bold"
            >
              View Result
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}

function MiniStat({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="mt-1 text-xl font-black">{value}</div>
    </div>
  );
}
