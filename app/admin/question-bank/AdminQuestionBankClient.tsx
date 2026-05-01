
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type PracticeSet = {
  id: string;
  title: string;
  type: string;
  category: string | null;
  difficulty: string | null;
  isPublished: boolean;
};

type Question = {
  id: string;
  practiceSetId: string;
  text: string;
  category: string;
  difficulty: string;
  type: string;
  options: Record<string, string> | null;
  answer: string | null;
  explanation: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  transcript: string | null;
  replayLimit: number | null;
  tags: string[];
  points: number;
  orderIndex: number;
  isPublished: boolean;
  grammarPoint?: string | null;
  kanjiTarget?: string | null;
  accessLevel?: string;
  _count?: {
    answers: number;
    wrongItems: number;
  };
};

const categories = [
  "VOCAB",
  "GRAMMAR",
  "READING",
  "LISTENING",
  "KANJI",
  "INFO",
  "SPEAKING",
  "OTHER",
];

const difficulties = ["EASY", "MEDIUM", "HARD", "OFFICIAL"];
const accessLevels = ["FREE", "PREMIUM", "CLASS_ONLY"];

const blankQuestion = {
  practiceSetId: "",
  text: "",
  category: "GRAMMAR",
  difficulty: "MEDIUM",
  type: "mcq",
  optionsText: `{
  "A": "",
  "B": "",
  "C": "",
  "D": ""
}`,
  answer: "A",
  explanation: "",
  imageUrl: "",
  audioUrl: "",
  transcript: "",
  replayLimit: "",
  tags: "N4",
  points: "1",
  orderIndex: "0",
  isPublished: true,
  grammarPoint: "",
  kanjiTarget: "",
  accessLevel: "FREE",
};

export default function AdminQuestionBankPage() {
  const searchParams = useSearchParams();
  const initialSetId = searchParams.get("setId") || "";

  const [sets, setSets] = useState<PracticeSet[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSetId, setSelectedSetId] = useState(initialSetId);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(blankQuestion);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadSets() {
    const res = await fetch("/api/admin/practice-sets");
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to load sets");
      return;
    }

    setSets(data);

    if (!selectedSetId && data[0]?.id) {
      setSelectedSetId(data[0].id);
      setForm((prev) => ({
        ...prev,
        practiceSetId: data[0].id,
      }));
    }
  }

  async function loadQuestions(setId?: string) {
    const finalSetId = setId || selectedSetId;
    const url = finalSetId
      ? `/api/admin/questions?practiceSetId=${finalSetId}`
      : "/api/admin/questions";

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to load questions");
      return;
    }

    setQuestions(data);
  }

  async function loadAll() {
    setLoading(true);
    await loadSets();
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (selectedSetId) {
      setForm((prev) => ({
        ...prev,
        practiceSetId: selectedSetId,
      }));
      loadQuestions(selectedSetId);
    }
  }, [selectedSetId]);

  const filteredQuestions = useMemo(() => {
    const q = search.toLowerCase();

    return questions.filter((question) => {
      return (
        question.text.toLowerCase().includes(q) ||
        question.category.toLowerCase().includes(q) ||
        question.difficulty.toLowerCase().includes(q) ||
        question.tags.join(" ").toLowerCase().includes(q)
      );
    });
  }, [questions, search]);

  function resetForm() {
    setEditingId(null);
    setForm({
      ...blankQuestion,
      practiceSetId: selectedSetId,
    });
  }

  function startEdit(question: Question) {
    setEditingId(question.id);
    setForm({
      practiceSetId: question.practiceSetId,
      text: question.text || "",
      category: question.category || "OTHER",
      difficulty: question.difficulty || "MEDIUM",
      type: question.type || "mcq",
      optionsText: JSON.stringify(question.options || {}, null, 2),
      answer: question.answer || "",
      explanation: question.explanation || "",
      imageUrl: question.imageUrl || "",
      audioUrl: question.audioUrl || "",
      transcript: question.transcript || "",
      replayLimit: question.replayLimit ? String(question.replayLimit) : "",
      tags: question.tags?.join(", ") || "",
      points: String(question.points || 1),
      orderIndex: String(question.orderIndex || 0),
      isPublished: question.isPublished,
      grammarPoint: question.grammarPoint || "",
      kanjiTarget: question.kanjiTarget || "",
      accessLevel: question.accessLevel || "FREE",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function parseOptionsOrAlert() {
    try {
      const parsed = JSON.parse(form.optionsText);
      return parsed;
    } catch {
      alert("Options must be valid JSON.");
      return null;
    }
  }

  async function saveQuestion(e: React.FormEvent) {
    e.preventDefault();

    const options = parseOptionsOrAlert();
    if (!options) return;

    if (!form.practiceSetId) {
      alert("Please select a practice set.");
      return;
    }

    setSaving(true);

    const payload = {
      practiceSetId: form.practiceSetId,
      text: form.text,
      category: form.category,
      difficulty: form.difficulty,
      type: form.type,
      options,
      answer: form.answer,
      explanation: form.explanation,
      imageUrl: form.imageUrl,
      audioUrl: form.audioUrl,
      transcript: form.transcript,
      replayLimit: form.replayLimit ? Number(form.replayLimit) : null,
      tags: form.tags,
      points: Number(form.points || 1),
      orderIndex: Number(form.orderIndex || 0),
      isPublished: form.isPublished,
      grammarPoint: form.grammarPoint,
      kanjiTarget: form.kanjiTarget,
      accessLevel: form.accessLevel,
    };

    const res = await fetch(
      editingId
        ? `/api/admin/questions/${editingId}`
        : "/api/admin/questions",
      {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to save question");
    } else {
      resetForm();
      await loadQuestions(selectedSetId);
    }

    setSaving(false);
  }

  async function togglePublish(question: Question) {
    const res = await fetch(`/api/admin/questions/${question.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isPublished: !question.isPublished,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to update question");
      return;
    }

    await loadQuestions(selectedSetId);
  }

  async function duplicateQuestion(question: Question) {
    const res = await fetch("/api/admin/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        practiceSetId: question.practiceSetId,
        text: question.text + " COPY",
        category: question.category,
        difficulty: question.difficulty,
        type: question.type,
        options: question.options,
        answer: question.answer,
        explanation: question.explanation,
        imageUrl: question.imageUrl,
        audioUrl: question.audioUrl,
        transcript: question.transcript,
        replayLimit: question.replayLimit,
        tags: question.tags,
        points: question.points,
        orderIndex: question.orderIndex + 1,
        isPublished: false,
        grammarPoint: question.grammarPoint,
        kanjiTarget: question.kanjiTarget,
        accessLevel: question.accessLevel || "FREE",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to duplicate question");
      return;
    }

    await loadQuestions(selectedSetId);
  }

  async function deleteQuestion(question: Question) {
    const ok = confirm(
      `Delete this question?\n\n${question.text}\n\nIf students already answered it, it will be unpublished instead.`
    );

    if (!ok) return;

    const res = await fetch(`/api/admin/questions/${question.id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete question");
      return;
    }

    if (data.unpublished) {
      alert(data.message);
    }

    await loadQuestions(selectedSetId);
  }

  if (loading) return <div className="p-6">Loading question bank...</div>;

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 rounded-[2rem] bg-white p-8 shadow">
          <p className="font-bold text-blue-700">Admin</p>
          <h1 className="mt-2 text-4xl font-black">Question Bank</h1>
          <p className="mt-3 text-slate-600">
            Add, edit, duplicate, publish, unpublish, and delete JFT/N4 questions.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/practice-sets"
              className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
            >
              Practice Set Builder
            </Link>

            <Link
              href="/admin/import-ai"
              className="rounded-2xl border bg-white px-5 py-3 font-bold"
            >
              AI / PDF Import
            </Link>
          </div>
        </div>

        <form onSubmit={saveQuestion} className="mb-8 rounded-[2rem] bg-white p-6 shadow">
          <h2 className="text-2xl font-black">
            {editingId ? "Edit Question" : "Create Question"}
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="font-bold">Practice Set</span>
              <select
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.practiceSetId}
                onChange={(e) => {
                  setSelectedSetId(e.target.value);
                  setForm({ ...form, practiceSetId: e.target.value });
                }}
              >
                <option value="">Select set</option>
                {sets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.title} — {set.type}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="font-bold">Question Text</span>
              <textarea
                className="mt-2 min-h-28 w-full rounded-2xl border p-3"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                required
              />
            </label>

            <label className="block">
              <span className="font-bold">Category</span>
              <select
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-bold">Difficulty</span>
              <select
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.difficulty}
                onChange={(e) =>
                  setForm({ ...form, difficulty: e.target.value })
                }
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty}>{difficulty}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-bold">Question Type</span>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                placeholder="mcq, image-mcq, audio-mcq"
              />
            </label>

            <label className="block">
              <span className="font-bold">Correct Answer</span>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="A"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="font-bold">Options JSON</span>
              <textarea
                className="mt-2 min-h-40 w-full rounded-2xl border p-3 font-mono text-sm"
                value={form.optionsText}
                onChange={(e) =>
                  setForm({ ...form, optionsText: e.target.value })
                }
              />
            </label>

            <label className="block md:col-span-2">
              <span className="font-bold">Explanation</span>
              <textarea
                className="mt-2 min-h-24 w-full rounded-2xl border p-3"
                value={form.explanation}
                onChange={(e) =>
                  setForm({ ...form, explanation: e.target.value })
                }
              />
            </label>

            <label className="block">
              <span className="font-bold">Image URL</span>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="font-bold">Audio URL</span>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.audioUrl}
                onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="font-bold">Transcript</span>
              <textarea
                className="mt-2 min-h-20 w-full rounded-2xl border p-3"
                value={form.transcript}
                onChange={(e) =>
                  setForm({ ...form, transcript: e.target.value })
                }
              />
            </label>

            <label className="block">
              <span className="font-bold">Replay Limit</span>
              <input
                type="number"
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.replayLimit}
                onChange={(e) =>
                  setForm({ ...form, replayLimit: e.target.value })
                }
              />
            </label>

            <label className="block">
              <span className="font-bold">Tags</span>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="N4, grammar, official"
              />
            </label>

            <label className="block">
              <span className="font-bold">Points</span>
              <input
                type="number"
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.points}
                onChange={(e) => setForm({ ...form, points: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="font-bold">Order Index</span>
              <input
                type="number"
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.orderIndex}
                onChange={(e) =>
                  setForm({ ...form, orderIndex: e.target.value })
                }
              />
            </label>

            <label className="block">
              <span className="font-bold">Grammar Point</span>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.grammarPoint}
                onChange={(e) =>
                  setForm({ ...form, grammarPoint: e.target.value })
                }
              />
            </label>

            <label className="block">
              <span className="font-bold">Kanji Target</span>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.kanjiTarget}
                onChange={(e) =>
                  setForm({ ...form, kanjiTarget: e.target.value })
                }
              />
            </label>

            <label className="block">
              <span className="font-bold">Access Level</span>
              <select
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.accessLevel}
                onChange={(e) =>
                  setForm({ ...form, accessLevel: e.target.value })
                }
              >
                {accessLevels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3 pt-8">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm({ ...form, isPublished: e.target.checked })
                }
              />
              <span className="font-bold">Published</span>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={saving}
              className="rounded-2xl bg-black px-6 py-3 font-bold text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Question"
                : "Create Question"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border bg-white px-6 py-3 font-bold"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="mb-6 grid gap-4 md:grid-cols-[1fr_2fr]">
          <select
            className="rounded-2xl border bg-white p-4"
            value={selectedSetId}
            onChange={(e) => setSelectedSetId(e.target.value)}
          >
            <option value="">All Sets</option>
            {sets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.title}
              </option>
            ))}
          </select>

          <input
            className="rounded-2xl border bg-white p-4"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-5">
          {filteredQuestions.map((question, index) => (
            <div key={question.id} className="rounded-[2rem] bg-white p-6 shadow">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold">
                      #{question.orderIndex || index + 1}
                    </span>

                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold">
                      {question.category}
                    </span>

                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold">
                      {question.difficulty}
                    </span>

                    <span
                      className={`rounded-xl px-3 py-1 text-xs font-bold ${
                        question.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {question.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-black leading-8">
                    {question.text}
                  </h3>

                  {question.options && (
                    <div className="mt-4 grid gap-2 md:grid-cols-2">
                      {Object.entries(question.options).map(([key, value]) => (
                        <div
                          key={key}
                          className={`rounded-xl border p-3 ${
                            key === question.answer
                              ? "border-green-500 bg-green-50"
                              : ""
                          }`}
                        >
                          <b>{key}.</b> {value}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.explanation && (
                    <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-slate-700">
                      {question.explanation}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
                    <span>Type: {question.type}</span>
                    <span>Answer: {question.answer || "-"}</span>
                    <span>Tags: {question.tags.join(", ") || "-"}</span>
                    <span>Student Answers: {question._count?.answers || 0}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:max-w-[260px]">
                  <button
                    onClick={() => startEdit(question)}
                    className="rounded-xl border px-4 py-2 font-bold"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => togglePublish(question)}
                    className="rounded-xl border px-4 py-2 font-bold"
                  >
                    {question.isPublished ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    onClick={() => duplicateQuestion(question)}
                    className="rounded-xl border px-4 py-2 font-bold"
                  >
                    Duplicate
                  </button>

                  <button
                    onClick={() => deleteQuestion(question)}
                    className="rounded-xl border border-red-300 px-4 py-2 font-bold text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredQuestions.length === 0 && (
            <div className="rounded-3xl bg-white p-8 text-center shadow">
              <h3 className="text-2xl font-black">No questions found</h3>
              <p className="mt-2 text-slate-500">
                Create a question using the form above.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
