
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ClassRoom = {
  id: string;
  name: string;
  description: string | null;
  joinCode: string;
  members: { id: string; user: { id: string; name: string | null; email: string } }[];
  assignments: { id: string; practiceSet: { id: string; title: string; type: string } }[];
};

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    joinCode: "",
  });

  async function loadClasses() {
    const res = await fetch("/api/teacher/classes");
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to load classes");
      return;
    }

    setClasses(data);
    setLoading(false);
  }

  useEffect(() => {
    loadClasses();
  }, []);

  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/teacher/classes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to create class");
    } else {
      setForm({
        name: "",
        description: "",
        joinCode: "",
      });
      await loadClasses();
    }

    setSaving(false);
  }

  if (loading) return <div className="p-6">Loading classes...</div>;

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow">
          <p className="font-bold text-blue-700">Teacher / Admin</p>
          <h1 className="mt-2 text-4xl font-black">Class Assignment Builder</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Create classes, add students, assign practice sets, and track class performance.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/practice-sets"
              className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
            >
              Practice Set Builder
            </Link>
            <Link
                href="/teacher/calendar"
                className="rounded-2xl border bg-white px-5 py-3 font-bold"
>
                    Assignment Calendar
            </Link>
            <Link
              href="/admin"
              className="rounded-2xl border bg-white px-5 py-3 font-bold"
            >
              Admin Dashboard
            </Link>
          </div>
        </section>

        <form onSubmit={createClass} className="mt-8 rounded-[2rem] bg-white p-6 shadow">
          <h2 className="text-2xl font-black">Create Class</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <label className="block">
              <span className="font-bold">Class Name</span>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="JFT N4 Morning Batch"
                required
              />
            </label>

            <label className="block">
              <span className="font-bold">Join Code</span>
              <input
                className="mt-2 w-full rounded-2xl border p-3 uppercase"
                value={form.joinCode}
                onChange={(e) =>
                  setForm({ ...form, joinCode: e.target.value.toUpperCase() })
                }
                placeholder="Optional, e.g. JFTMORNING"
              />
            </label>

            <label className="block">
              <span className="font-bold">Description</span>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Demo class"
              />
            </label>
          </div>

          <button
            disabled={saving}
            className="mt-6 rounded-2xl bg-black px-6 py-3 font-bold text-white disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Class"}
          </button>
        </form>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {classes.map((classRoom) => (
            <Link
              key={classRoom.id}
              href={`/teacher/classes/${classRoom.id}`}
              className="rounded-[2rem] bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-black">{classRoom.name}</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                  {classRoom.joinCode}
                </span>
              </div>

              <p className="mt-3 text-slate-600">{classRoom.description}</p>

              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <span className="rounded-xl bg-slate-100 px-3 py-2">
                  {classRoom.members.length} students
                </span>
                <span className="rounded-xl bg-slate-100 px-3 py-2">
                  {classRoom.assignments.length} assignments
                </span>
              </div>
            </Link>
          ))}

          {classes.length === 0 && (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow md:col-span-2">
              <h2 className="text-2xl font-black">No classes yet</h2>
              <p className="mt-2 text-slate-500">Create your first class above.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
