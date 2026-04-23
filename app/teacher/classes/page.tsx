"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ClassRoom = {
  id: string;
  name: string;
  teacherId: string;
};

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("teacher-demo-id");

  async function loadClasses() {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/classes");
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      console.error("Failed to load classes:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClasses();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/teacher/classes/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, teacherId }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to create class");
      return;
    }

    setName("");
    await loadClasses();
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="mt-2 text-zinc-600">
            Create classes and monitor student progress.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow lg:col-span-1">
            <h2 className="text-xl font-semibold">Create New Class</h2>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <input
                className="w-full rounded-2xl border p-3"
                placeholder="Class name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="w-full rounded-2xl border p-3"
                placeholder="Teacher ID"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
              />

              <button
                type="submit"
                className="w-full rounded-2xl bg-black px-5 py-3 font-medium text-white transition hover:bg-zinc-800"
              >
                Create Class
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow lg:col-span-2">
            <h2 className="text-xl font-semibold">Classes</h2>

            {loading ? (
              <div className="mt-4">Loading classes...</div>
            ) : classes.length === 0 ? (
              <div className="mt-4 rounded-2xl border p-4 text-zinc-500">No classes found.</div>
            ) : (
              <div className="mt-4 grid gap-4">
                {classes.map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/teacher/classes/${cls.id}`}
                    className="rounded-2xl border p-5 transition hover:bg-zinc-50"
                  >
                    <div className="text-lg font-semibold">{cls.name}</div>
                    <div className="mt-1 text-sm text-zinc-500">Class ID: {cls.id}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}