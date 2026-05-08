"use client";

import { useEffect, useState } from "react";

type Question = {
  id: string;
  text: string;
  category: string;
  difficulty?: string;
  type: string;
  options: any;
  answer: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  explanation?: string | null;
  isPublished: boolean;
  practiceSet?: {
    id: string;
    title: string;
  };
};

type PracticeSet = {
  id: string;
  title: string;
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sets, setSets] = useState<PracticeSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    practiceSetId: "",
    text: "",
    category: "VOCAB",
    difficulty: "MEDIUM",
    type: "mcq",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    answer: "A",
    imageUrl: "",
    audioUrl: "",
    explanation: "",
  });

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [qRes, sRes] = await Promise.all([
        fetch("/api/admin/questions"),
        fetch("/api/admin/practice-sets"),
      ]);

      const qData = await qRes.json();
      const sData = await sRes.json();

      if (!qRes.ok) {
        throw new Error(qData.error || "Failed to load questions");
      }

      if (!sRes.ok) {
        throw new Error(sData.error || "Failed to load practice sets");
      }

      setQuestions(Array.isArray(qData) ? qData : qData.questions || []);
      setSets(Array.isArray(sData) ? sData : sData.practiceSets || sData.sets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setQuestions([]);
      setSets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.practiceSetId) {
      alert("Please select a practice/exam set");
      return;
    }

    const payload = {
      practiceSetId: form.practiceSetId,
      text: form.text,
      category: form.category,
      difficulty: form.difficulty,
      type: form.type,
      options: {
        A: form.optionA,
        B: form.optionB,
        C: form.optionC,
        D: form.optionD,
      },
      answer: form.answer,
      imageUrl: form.imageUrl,
      audioUrl: form.audioUrl,
      explanation: form.explanation,
      tags: [],
      points: 1,
    };

    const res = await fetch("/api/admin/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to create question");
      return;
    }

    setForm({
      practiceSetId: "",
      text: "",
      category: "VOCAB",
      difficulty: "MEDIUM",
      type: "mcq",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      answer: "A",
      imageUrl: "",
      audioUrl: "",
      explanation: "",
    });

    await loadData();
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question?")) return;

    const res = await fetch(`/api/admin/questions/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete question");
      return;
    }

    alert(data.message || "Question deleted");
    await loadData();
  }

  async function togglePublish(q: Question) {
    const res = await fetch(`/api/admin/questions/${q.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isPublished: !q.isPublished,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to update question");
      return;
    }

    await loadData();
  }

  if (loading) {
    return <div className="p-6">Loading admin questions...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-100 p-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-red-600">Admin Access Error</h1>
          <p className="mt-3">{error}</p>

          <a
            href="/login"
            className="mt-5 inline-block rounded-xl bg-black px-4 py-2 text-white"
          >
            Login as Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Question Manager</h1>
            <p className="mt-2 text-zinc-600">
              Create, edit, publish, unpublish, and delete questions.
            </p>
          </div>

          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="rounded-xl border bg-white px-4 py-2"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow lg:col-span-1">
            <h2 className="text-xl font-semibold">Create Question</h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <select
                className="w-full rounded-2xl border p-3"
                value={form.practiceSetId}
                onChange={(e) =>
                  setForm({ ...form, practiceSetId: e.target.value })
                }
              >
                <option value="">Select Practice/Exam Set</option>
                {sets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.title}
                  </option>
                ))}
              </select>

              <textarea
                className="w-full rounded-2xl border p-3"
                placeholder="Question text"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />

              <select
                className="w-full rounded-2xl border p-3"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="VOCAB">VOCAB</option>
                <option value="GRAMMAR">GRAMMAR</option>
                <option value="READING">READING</option>
                <option value="LISTENING">LISTENING</option>
                <option value="KANJI">KANJI</option>
                <option value="INFO">INFO</option>
                <option value="SPEAKING">SPEAKING</option>
                <option value="OTHER">OTHER</option>
              </select>

              <select
                className="w-full rounded-2xl border p-3"
                value={form.difficulty}
                onChange={(e) =>
                  setForm({ ...form, difficulty: e.target.value })
                }
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
                <option value="OFFICIAL">OFFICIAL</option>
              </select>

              <input
                className="w-full rounded-2xl border p-3"
                placeholder="Option A"
                value={form.optionA}
                onChange={(e) => setForm({ ...form, optionA: e.target.value })}
              />

              <input
                className="w-full rounded-2xl border p-3"
                placeholder="Option B"
                value={form.optionB}
                onChange={(e) => setForm({ ...form, optionB: e.target.value })}
              />

              <input
                className="w-full rounded-2xl border p-3"
                placeholder="Option C"
                value={form.optionC}
                onChange={(e) => setForm({ ...form, optionC: e.target.value })}
              />

              <input
                className="w-full rounded-2xl border p-3"
                placeholder="Option D"
                value={form.optionD}
                onChange={(e) => setForm({ ...form, optionD: e.target.value })}
              />

              <select
                className="w-full rounded-2xl border p-3"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
              >
                <option value="A">Correct Answer: A</option>
                <option value="B">Correct Answer: B</option>
                <option value="C">Correct Answer: C</option>
                <option value="D">Correct Answer: D</option>
              </select>

              <input
                className="w-full rounded-2xl border p-3"
                placeholder="Image URL optional"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />

              <input
                className="w-full rounded-2xl border p-3"
                placeholder="Audio URL optional"
                value={form.audioUrl}
                onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
              />

              <textarea
                className="w-full rounded-2xl border p-3"
                placeholder="Explanation optional"
                value={form.explanation}
                onChange={(e) =>
                  setForm({ ...form, explanation: e.target.value })
                }
              />

              <button
                type="submit"
                className="w-full rounded-2xl bg-black px-5 py-3 font-medium text-white"
              >
                Create Question
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow lg:col-span-2">
            <h2 className="text-xl font-semibold">Question List</h2>

            {questions.length === 0 ? (
              <div className="mt-4 text-zinc-500">No questions found.</div>
            ) : (
              <div className="mt-4 space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="rounded-2xl border p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{q.text}</div>

                        <div className="mt-1 text-sm text-zinc-500">
                          Set: {q.practiceSet?.title || "-"} | Category:{" "}
                          {q.category} | Type: {q.type}
                        </div>

                        <div className="mt-2 text-sm">
                          Status:{" "}
                          <span
                            className={
                              q.isPublished
                                ? "font-bold text-green-600"
                                : "font-bold text-red-600"
                            }
                          >
                            {q.isPublished ? "Published" : "Unpublished"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {q.imageUrl && (
                      <img
                        src={q.imageUrl}
                        alt="Question"
                        className="mt-4 max-h-56 rounded-xl border object-contain"
                      />
                    )}

                    {q.audioUrl && (
                      <audio controls className="mt-4 w-full">
                        <source src={q.audioUrl} />
                      </audio>
                    )}

                    <pre className="mt-3 overflow-auto rounded-xl bg-zinc-100 p-3 text-sm">
                      {JSON.stringify(q.options, null, 2)}
                    </pre>

                    {q.explanation && (
                      <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-zinc-700">
                        {q.explanation}
                      </div>
                    )}

                    <div className="mt-3 font-semibold">
                      Correct Answer: {q.answer}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={`/admin/questions/${q.id}/edit`}
                        className="rounded-xl bg-blue-500 px-4 py-2 font-bold text-white"
                      >
                        Edit
                      </a>

                      <button
                        onClick={() => togglePublish(q)}
                        className="rounded-xl bg-yellow-500 px-4 py-2 font-bold text-white"
                      >
                        {q.isPublished ? "Unpublish" : "Publish"}
                      </button>

                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="rounded-xl bg-red-500 px-4 py-2 font-bold text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}