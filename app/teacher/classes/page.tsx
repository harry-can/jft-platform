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
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Teacher Classes</h1>

      <form onSubmit={handleCreate} className="border rounded-2xl p-5 space-y-4">
        <h2 className="text-xl font-semibold">Create New Class</h2>

        <input
          className="border rounded-lg p-3 w-full"
          placeholder="Class name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border rounded-lg p-3 w-full"
          placeholder="Teacher ID"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
        />

        <button
          type="submit"
          className="px-5 py-3 bg-black text-white rounded-xl"
        >
          Create Class
        </button>
      </form>

      {loading ? (
        <div>Loading classes...</div>
      ) : classes.length === 0 ? (
        <div className="border rounded-xl p-4">No classes found.</div>
      ) : (
        <div className="grid gap-4">
          {classes.map((cls) => (
            <Link
              key={cls.id}
              href={`/teacher/classes/${cls.id}`}
              className="border rounded-2xl p-5 hover:bg-gray-50 transition"
            >
              <div className="text-xl font-semibold">{cls.name}</div>
              <div className="text-sm text-gray-500">Class ID: {cls.id}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}