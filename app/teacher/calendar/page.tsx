
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type CalendarAssignment = {
  id: string;
  dueDate: string | null;
  createdAt: string;
  status: string;
  classRoom: {
    id: string;
    name: string;
    joinCode: string;
  };
  practiceSet: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    category: string | null;
    difficulty: string | null;
    isPublished: boolean;
    releaseAt: string | null;
    timeLimitMin: number | null;
    questionCount: number;
  };
  summary: {
    totalStudents: number;
    completedCount: number;
    pendingCount: number;
  };
  students: {
    id: string;
    name: string | null;
    email: string;
    isActive: boolean;
    completed: boolean;
    latestAttempt: any;
  }[];
};

type CalendarData = {
  summary: {
    totalClasses: number;
    totalAssignments: number;
    scheduled: number;
    upcoming: number;
    active: number;
    overdue: number;
    completed: number;
  };
  classes: {
    id: string;
    name: string;
    joinCode: string;
  }[];
  assignments: CalendarAssignment[];
};

export default function TeacherCalendarPage() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [classId, setClassId] = useState("");
  const [status, setStatus] = useState("ALL");
  const [reminderMessage, setReminderMessage] = useState("");

  async function loadCalendar(nextClassId = classId, nextStatus = status) {
    setLoading(true);

    const params = new URLSearchParams();

    if (nextClassId) params.set("classId", nextClassId);
    if (nextStatus !== "ALL") params.set("status", nextStatus);

    const url = `/api/teacher/calendar${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const res = await fetch(url);
    const json = await res.json();

    if (!res.ok) {
      alert(json.error || "Failed to load calendar");
      setLoading(false);
      return;
    }

    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    loadCalendar();
  }, []);

  async function updateClass(value: string) {
    setClassId(value);
    await loadCalendar(value, status);
  }

  async function updateStatus(value: string) {
    setStatus(value);
    await loadCalendar(classId, value);
  }

  async function sendReminder(assignment: CalendarAssignment) {
    const ok = confirm(
      `Send reminder to ${assignment.summary.pendingCount} pending student(s)?`
    );

    if (!ok) return;

    const res = await fetch(
      `/api/teacher/classes/${assignment.classRoom.id}/assignments/remind`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          practiceSetId: assignment.practiceSet.id,
          message: reminderMessage,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to send reminders");
      return;
    }

    alert(`Reminder sent to ${data.createdCount} student(s).`);
    setReminderMessage("");
  }

  const sortedAssignments = useMemo(() => {
    if (!data) return [];

    return [...data.assignments].sort((a, b) => {
      const aDate = a.dueDate
        ? new Date(a.dueDate).getTime()
        : a.practiceSet.releaseAt
        ? new Date(a.practiceSet.releaseAt).getTime()
        : new Date(a.createdAt).getTime();

      const bDate = b.dueDate
        ? new Date(b.dueDate).getTime()
        : b.practiceSet.releaseAt
        ? new Date(b.practiceSet.releaseAt).getTime()
        : new Date(b.createdAt).getTime();

      return aDate - bDate;
    });
  }, [data]);

  if (loading && !data) {
    return <div className="p-6">Loading calendar...</div>;
  }

  if (!data) {
    return <div className="p-6">No calendar data found.</div>;
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow">
          <p className="font-bold text-blue-700">Teacher / Admin Calendar</p>
          <h1 className="mt-2 text-4xl font-black">
            Assignment Calendar & Scheduling
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Track scheduled, upcoming, active, overdue, and completed class assignments.
            Send manual reminders to pending students.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/teacher/classes"
              className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
            >
              Class Builder
            </Link>

            <Link
              href="/admin/practice-sets"
              className="rounded-2xl border bg-white px-5 py-3 font-bold"
            >
              Practice Sets
            </Link>

            <Link
              href="/admin"
              className="rounded-2xl border bg-white px-5 py-3 font-bold"
            >
              Admin Dashboard
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-4 lg:grid-cols-7">
          <Card title="Classes" value={data.summary.totalClasses} />
          <Card title="Assignments" value={data.summary.totalAssignments} />
          <Card title="Scheduled" value={data.summary.scheduled} />
          <Card title="Upcoming" value={data.summary.upcoming} />
          <Card title="Active" value={data.summary.active} />
          <Card title="Overdue" value={data.summary.overdue} />
          <Card title="Completed" value={data.summary.completed} />
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="font-bold">Class</span>
              <select
                className="mt-2 w-full rounded-2xl border p-3"
                value={classId}
                onChange={(e) => updateClass(e.target.value)}
              >
                <option value="">All classes</option>
                {data.classes.map((classRoom) => (
                  <option key={classRoom.id} value={classRoom.id}>
                    {classRoom.name} — {classRoom.joinCode}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-bold">Status</span>
              <select
                className="mt-2 w-full rounded-2xl border p-3"
                value={status}
                onChange={(e) => updateStatus(e.target.value)}
              >
                <option value="ALL">ALL</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="UPCOMING">UPCOMING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="OVERDUE">OVERDUE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="NO_DUE_DATE">NO_DUE_DATE</option>
              </select>
            </label>

            <label className="block">
              <span className="font-bold">Reminder Message</span>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                placeholder="Optional custom reminder"
              />
            </label>
          </div>
        </section>

        <section className="mt-8 space-y-5">
          {sortedAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onRemind={() => sendReminder(assignment)}
            />
          ))}

          {sortedAssignments.length === 0 && (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow">
              <h2 className="text-2xl font-black">No assignments found</h2>
              <p className="mt-2 text-slate-500">
                Create a class assignment to see it here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function AssignmentCard({
  assignment,
  onRemind,
}: {
  assignment: CalendarAssignment;
  onRemind: () => void;
}) {
  const statusClass =
    assignment.status === "OVERDUE"
      ? "bg-red-100 text-red-700"
      : assignment.status === "COMPLETED"
      ? "bg-green-100 text-green-700"
      : assignment.status === "UPCOMING"
      ? "bg-blue-100 text-blue-700"
      : assignment.status === "SCHEDULED"
      ? "bg-purple-100 text-purple-700"
      : "bg-yellow-100 text-yellow-700";

  const pendingStudents = assignment.students.filter((s) => !s.completed);

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass}`}>
              {assignment.status}
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

          <h2 className="mt-4 text-2xl font-black">
            {assignment.practiceSet.title}
          </h2>

          <p className="mt-2 text-slate-600">
            {assignment.practiceSet.description || "No description"}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {assignment.practiceSet.releaseAt && (
              <span className="rounded-xl bg-purple-50 px-3 py-2 text-purple-700">
                Release: {new Date(assignment.practiceSet.releaseAt).toLocaleString()}
              </span>
            )}

            {assignment.dueDate && (
              <span className="rounded-xl bg-blue-50 px-3 py-2 text-blue-700">
                Due: {new Date(assignment.dueDate).toLocaleString()}
              </span>
            )}

            <span className="rounded-xl bg-slate-100 px-3 py-2">
              {assignment.practiceSet.questionCount} questions
            </span>

            {assignment.practiceSet.timeLimitMin && (
              <span className="rounded-xl bg-slate-100 px-3 py-2">
                {assignment.practiceSet.timeLimitMin} minutes
              </span>
            )}

            <span className="rounded-xl bg-slate-100 px-3 py-2">
              Done: {assignment.summary.completedCount}/{assignment.summary.totalStudents}
            </span>

            <span className="rounded-xl bg-slate-100 px-3 py-2">
              Pending: {assignment.summary.pendingCount}
            </span>
          </div>

          {pendingStudents.length > 0 && (
            <details className="mt-5 rounded-2xl border p-4">
              <summary className="cursor-pointer font-black">
                Pending Students ({pendingStudents.length})
              </summary>

              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {pendingStudents.map((student) => (
                  <div key={student.id} className="rounded-xl bg-slate-50 p-3">
                    <div className="font-bold">{student.name || student.email}</div>
                    <div className="text-sm text-slate-500">{student.email}</div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        <div className="flex flex-wrap gap-2 lg:min-w-[260px] lg:justify-end">
          <Link
            href={`/test-engine?mode=SET&setId=${assignment.practiceSet.id}`}
            className="rounded-xl bg-black px-4 py-2 font-bold text-white"
          >
            Preview
          </Link>

          <Link
            href={`/teacher/classes/${assignment.classRoom.id}`}
            className="rounded-xl border px-4 py-2 font-bold"
          >
            Class
          </Link>

          <button
            onClick={onRemind}
            disabled={assignment.summary.pendingCount === 0}
            className="rounded-xl border border-blue-300 px-4 py-2 font-bold text-blue-700 disabled:opacity-50"
          >
            Send Reminder
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}
