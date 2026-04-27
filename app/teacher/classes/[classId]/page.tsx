
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { release } from "os";

type PracticeSet = {
  id: string;
  title: string;
  type: string;
  category: string | null;
  difficulty: string | null;
  isPublished: boolean;
};

export default function TeacherClassDetailPage() {
  const params = useParams();
  const classId = params.classId as string;

  const [classRoom, setClassRoom] = useState<any | null>(null);
  const [performance, setPerformance] = useState<any | null>(null);
  const [sets, setSets] = useState<PracticeSet[]>([]);
  const [loading, setLoading] = useState(true);

  const [studentEmail, setStudentEmail] = useState("");
  const [assignmentForm, setAssignmentForm] = useState({
    practiceSetId: "",
    releaseAt: "",
    dueDate: "",
  });

  async function loadClass() {
    const res = await fetch(`/api/teacher/classes/${classId}`);
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to load class");
      return;
    }

    setClassRoom(data);
  }

  async function loadPerformance() {
    const res = await fetch(`/api/teacher/classes/${classId}/performance`);
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to load performance");
      return;
    }

    setPerformance(data);
  }

  async function loadSets() {
    const res = await fetch("/api/admin/practice-sets");
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to load practice sets");
      return;
    }

    setSets(data);
  }

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadClass(), loadPerformance(), loadSets()]);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, [classId]);

  const publishedSets = useMemo(() => {
    return sets.filter((set) => set.isPublished);
  }, [sets]);

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch(`/api/teacher/classes/${classId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: studentEmail,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to add student");
      return;
    }

    setStudentEmail("");
    await loadAll();
  }

  async function removeStudent(userId: string) {
    const ok = confirm("Remove this student from class?");
    if (!ok) return;

    const res = await fetch(`/api/teacher/classes/${classId}/members`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to remove student");
      return;
    }

    await loadAll();
  }

  async function assignSet(e: React.FormEvent) {
    e.preventDefault();

    if (!assignmentForm.practiceSetId) {
      alert("Select a practice set.");
      return;
    }

    const res = await fetch(`/api/teacher/classes/${classId}/assignments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assignmentForm),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to assign set");
      return;
    }

    setAssignmentForm({
      practiceSetId: "",
      releaseAt: "",
      dueDate: "",
    });

    await loadAll();
  }

  async function removeAssignment(practiceSetId: string) {
    const ok = confirm("Remove this assignment?");
    if (!ok) return;

    const res = await fetch(`/api/teacher/classes/${classId}/assignments`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        practiceSetId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to remove assignment");
      return;
    }

    await loadAll();
  }

  if (loading) return <div className="p-6">Loading class...</div>;
  if (!classRoom) return <div className="p-6">Class not found.</div>;

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-bold text-blue-700">Class Detail</p>
              <h1 className="mt-2 text-4xl font-black">{classRoom.name}</h1>
              <p className="mt-3 text-slate-600">{classRoom.description}</p>
            </div>

            <div className="rounded-2xl bg-blue-50 px-5 py-4 text-center">
              <div className="text-sm font-bold text-blue-700">Join Code</div>
              <div className="mt-1 text-2xl font-black text-blue-900">
                {classRoom.joinCode}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/teacher/classes"
              className="rounded-2xl border bg-white px-5 py-3 font-bold"
            >
              All Classes
            </Link>

            <Link
              href="/admin/practice-sets"
              className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
            >
              Practice Set Builder
            </Link>
          </div>
        </section>

        {performance && (
          <section className="mt-8 grid gap-5 md:grid-cols-4">
            <Card title="Students" value={performance.summary.totalStudents} />
            <Card title="Completed" value={performance.summary.completedStudents} />
            <Card title="Assignments" value={performance.summary.assignedSets} />
            <Card title="Class Avg" value={`${performance.summary.classAvg}%`} />
          </section>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <form onSubmit={addStudent} className="rounded-[2rem] bg-white p-6 shadow">
            <h2 className="text-2xl font-black">Add Student</h2>
            <p className="mt-2 text-slate-600">
              Student must already have an account.
            </p>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">
              <input
                type="email"
                className="flex-1 rounded-2xl border p-3"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@example.com"
                required
              />

              <button className="rounded-2xl bg-black px-5 py-3 font-bold text-white">
                Add
              </button>
            </div>
          </form>

          <form onSubmit={assignSet} className="rounded-[2rem] bg-white p-6 shadow">
            <h2 className="text-2xl font-black">Assign Practice Set</h2>
            <p className="mt-2 text-slate-600">
              Assign published practice sets or official exams.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
  <select
    className="rounded-2xl border p-3"
    value={assignmentForm.practiceSetId}
    onChange={(e) =>
      setAssignmentForm({
        ...assignmentForm,
        practiceSetId: e.target.value,
      })
    }
  >
    <option value="">Select practice set</option>
    {publishedSets.map((set) => (
      <option key={set.id} value={set.id}>
        {set.title} — {set.type}
      </option>
    ))}
  </select>

  <input
    type="datetime-local"
    className="rounded-2xl border p-3"
    value={assignmentForm.releaseAt}
    onChange={(e) =>
      setAssignmentForm({
        ...assignmentForm,
        releaseAt: e.target.value,
      })
    }
    title="Release date"
  />

  <input
    type="date"
    className="rounded-2xl border p-3"
    value={assignmentForm.dueDate}
    onChange={(e) =>
      setAssignmentForm({
        ...assignmentForm,
        dueDate: e.target.value,
      })
    }
    title="Due date"
  />

  <button className="rounded-2xl bg-black px-5 py-3 font-bold text-white">
    Assign
  </button>
</div>
          </form>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-6 shadow">
            <h2 className="text-2xl font-black">Students</h2>

            <div className="mt-5 space-y-3">
              {classRoom.members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="font-black">
                      {member.user.name || member.user.email}
                    </div>
                    <div className="text-sm text-slate-500">{member.user.email}</div>
                  </div>

                  <button
                    onClick={() => removeStudent(member.user.id)}
                    className="rounded-xl border border-red-300 px-4 py-2 font-bold text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {classRoom.members.length === 0 && (
                <p className="text-slate-500">No students added yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow">
            <h2 className="text-2xl font-black">Assignments</h2>

            <div className="mt-5 space-y-3">
              {classRoom.assignments.map((assignment: any) => (
                <div key={assignment.id} className="rounded-2xl border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-black">
                        {assignment.practiceSet.title}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {assignment.practiceSet.type}
                        {assignment.dueDate
                          ? ` · Due ${new Date(
                              assignment.dueDate
                            ).toLocaleDateString()}`
                          : ""}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/test-engine?mode=SET&setId=${assignment.practiceSet.id}`}
                        className="rounded-xl bg-black px-4 py-2 font-bold text-white"
                      >
                        Preview
                      </Link>

                      <button
                        onClick={() =>
                          removeAssignment(assignment.practiceSet.id)
                        }
                        className="rounded-xl border border-red-300 px-4 py-2 font-bold text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {classRoom.assignments.length === 0 && (
                <p className="text-slate-500">No assignments yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow">
          <h2 className="text-2xl font-black">Class Performance</h2>

          {!performance || performance.students.length === 0 ? (
            <p className="mt-4 text-slate-500">No performance data yet.</p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-3">Student</th>
                    <th className="p-3">Attempts</th>
                    <th className="p-3">Average</th>
                    <th className="p-3">Best</th>
                    <th className="p-3">Weakest</th>
                    <th className="p-3">Latest</th>
                  </tr>
                </thead>

                <tbody>
                  {performance.students.map((student: any) => (
                    <tr key={student.id} className="border-b">
                      <td className="p-3">
                        <div className="font-bold">
                          {student.name || student.email}
                        </div>
                        <div className="text-sm text-slate-500">
                          {student.email}
                        </div>
                      </td>
                      <td className="p-3">{student.totalAttempts}</td>
                      <td className="p-3">{student.avgAccuracy}%</td>
                      <td className="p-3">{student.bestAccuracy}%</td>
                      <td className="p-3">
                        {student.weakestCategory
                          ? `${student.weakestCategory} (${Number(
                              student.weakestAccuracy
                            ).toFixed(1)}%)`
                          : "-"}
                      </td>
                      <td className="p-3">
                        {student.latestAttempt
                          ? `${student.latestAttempt.practiceSet.title} — ${Number(
                              student.latestAttempt.accuracy || 0
                            ).toFixed(1)}%`
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
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
