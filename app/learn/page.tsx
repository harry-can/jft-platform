
"use client";

import { useEffect, useState } from "react";

export default function LearnPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [active, setActive] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadLessons() {
    const res = await fetch("/api/learn");
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to load lessons");
      return;
    }

    setLessons(data);
    setActive(data[0] || null);
    setLoading(false);
  }

  useEffect(() => {
    loadLessons();
  }, []);

  async function completeLesson(lessonId: string) {
    const res = await fetch("/api/learn/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lessonId }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to complete lesson");
      return;
    }

    await loadLessons();
    alert("Lesson completed. +10 XP");
  }

  if (loading) return <div className="p-6">Loading lessons...</div>;

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-3xl bg-white p-5 shadow">
          <h1 className="text-2xl font-black">N4 Lessons</h1>

          <div className="mt-5 space-y-3">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => setActive(lesson)}
                className={`block w-full rounded-2xl border p-4 text-left ${
                  active?.id === lesson.id ? "border-black bg-slate-50" : ""
                }`}
              >
                <div className="font-bold">{lesson.title}</div>
                <div className="text-sm text-slate-500">
                  {lesson.type} {lesson.completed ? "✓" : ""}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl bg-white p-8 shadow">
          {!active ? (
            <p>No lesson found.</p>
          ) : (
            <>
              <p className="font-bold text-blue-700">{active.type}</p>
              <h2 className="mt-2 text-4xl font-black">{active.title}</h2>

              <article className="mt-6 whitespace-pre-wrap leading-8 text-slate-700">
                {active.content}
              </article>

              <button
                onClick={() => completeLesson(active.id)}
                className="mt-8 rounded-2xl bg-black px-6 py-3 font-bold text-white"
              >
                Mark Complete
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
