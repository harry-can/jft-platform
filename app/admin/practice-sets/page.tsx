
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PracticeSet = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  difficulty: string | null;
  isPublished: boolean;
  timeLimitMin: number | null;
  audioReplayLimit: number | null;
  accessLevel?: string;
  questions: { id: string; isPublished: boolean; category: string }[];
  attempts: { id: string }[];
};

const setTypes = [
  "CATEGORY_PRACTICE",
  "FULL_PRACTICE",
  "WRONG_RETRY",
  "OFFICIAL_EXAM",
];

const categories = [
  "NONE",
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

const initialForm = {
  title: "",
  description: "",
  type: "CATEGORY_PRACTICE",
  category: "GRAMMAR",
  difficulty: "MEDIUM",
  isPublished: false,
  timeLimitMin: "",
  audioReplayLimit: "",
  accessLevel: "FREE",
};

export default function AdminPracticeSetsPage() {
  const [sets, setSets] = useState<PracticeSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function loadSets() {
    const res = await fetch("/api/admin/practice-sets");
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to load practice sets");
      return;
    }

    setSets(data);
    setLoading(false);
  }

  useEffect(() => {
    loadSets();
  }, []);

  const filteredSets = useMemo(() => {
    const q = search.toLowerCase();

    return sets.filter((set) => {
      return (
        set.title.toLowerCase().includes(q) ||
        set.type.toLowerCase().includes(q) ||
        String(set.category || "").toLowerCase().includes(q)
      );
    });
  }, [sets, search]);

  function startEdit(set: PracticeSet) {
    setEditingId(set.id);
    setForm({
      title: set.title || "",
      description: set.description || "",
      type: set.type || "CATEGORY_PRACTICE",
      category: set.category || "NONE",
      difficulty: set.difficulty || "MEDIUM",
      isPublished: set.isPublished,
      timeLimitMin: set.timeLimitMin ? String(set.timeLimitMin) : "",
      audioReplayLimit: set.audioReplayLimit ? String(set.audioReplayLimit) : "",
      accessLevel: set.accessLevel || "FREE",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  async function saveSet(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      category: form.category === "NONE" ? null : form.category,
      timeLimitMin: form.timeLimitMin ? Number(form.timeLimitMin) : null,
      audioReplayLimit: form.audioReplayLimit
        ? Number(form.audioReplayLimit)
        : null,
    };

    const res = await fetch(
      editingId
        ? `/api/admin/practice-sets/${editingId}`
        : "/api/admin/practice-sets",
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
      alert(data.error || "Failed to save practice set");
    } else {
      resetForm();
      await loadSets();
    }

    setSaving(false);
  }

  async function togglePublish(set: PracticeSet) {
    const res = await fetch(`/api/admin/practice-sets/${set.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isPublished: !set.isPublished,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to update publish status");
      return;
    }

    await loadSets();
  }

  async function deleteSet(set: PracticeSet) {
    const ok = confirm(
      `Delete "${set.title}"?\n\nIf this set has student attempts, it cannot be deleted.`
    );

    if (!ok) return;

    const res = await fetch(`/api/admin/practice-sets/${set.id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete set");
      return;
    }

    await loadSets();
  }

  if (loading) return <div className="p-6">Loading practice sets...</div>;

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 rounded-[2rem] bg-white p-8 shadow">
          <p className="font-bold text-blue-700">Admin</p>
          <h1 className="mt-2 text-4xl font-black">Practice Set Builder</h1>
          <p className="mt-3 text-slate-600">
            Create official exams, full tests, category practice, and draft/published sets.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/question-bank"
              className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
            >
              Open Question Bank
            </Link>

            <Link
              href="/admin"
              className="rounded-2xl border bg-white px-5 py-3 font-bold"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>

        <form onSubmit={saveSet} className="mb-8 rounded-[2rem] bg-white p-6 shadow">
          <h2 className="text-2xl font-black">
            {editingId ? "Edit Practice Set" : "Create Practice Set"}
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="font-bold">Title</span>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>

            <label className="block">
              <span className="font-bold">Type</span>
              <select
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {setTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
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
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty}>{difficulty}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-bold">Time Limit Minutes</span>
              <input
                type="number"
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.timeLimitMin}
                onChange={(e) =>
                  setForm({ ...form, timeLimitMin: e.target.value })
                }
              />
            </label>

            <label className="block">
              <span className="font-bold">Audio Replay Limit</span>
              <input
                type="number"
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.audioReplayLimit}
                onChange={(e) =>
                  setForm({ ...form, audioReplayLimit: e.target.value })
                }
              />
            </label>

            <label className="block">
              <span className="font-bold">Access Level</span>
              <select
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.accessLevel}
                onChange={(e) => setForm({ ...form, accessLevel: e.target.value })}
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

            <label className="block md:col-span-2">
              <span className="font-bold">Description</span>
              <textarea
                className="mt-2 min-h-24 w-full rounded-2xl border p-3"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={saving}
              className="rounded-2xl bg-black px-6 py-3 font-bold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update Set" : "Create Set"}
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

        <div className="mb-6">
          <input
            className="w-full rounded-2xl border bg-white p-4"
            placeholder="Search by title, type, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid gap-5">
          {filteredSets.map((set) => {
            const publishedQuestions = set.questions.filter(
              (q) => q.isPublished
            ).length;

            return (
              <div key={set.id} className="rounded-[2rem] bg-white p-6 shadow">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl font-black">{set.title}</h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          set.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {set.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>

                    <p className="mt-2 text-slate-600">{set.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                      <span className="rounded-xl bg-slate-100 px-3 py-2">
                        {set.type}
                      </span>
                      <span className="rounded-xl bg-slate-100 px-3 py-2">
                        {set.category || "Mixed"}
                      </span>
                      <span className="rounded-xl bg-slate-100 px-3 py-2">
                        {set.difficulty || "No difficulty"}
                      </span>
                      <span className="rounded-xl bg-slate-100 px-3 py-2">
                        {set.questions.length} questions
                      </span>
                      <span className="rounded-xl bg-slate-100 px-3 py-2">
                        {publishedQuestions} published
                      </span>
                      <span className="rounded-xl bg-slate-100 px-3 py-2">
                        {set.attempts.length} attempts
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/question-bank?setId=${set.id}`}
                      className="rounded-xl bg-black px-4 py-2 font-bold text-white"
                    >
                      Manage Questions
                    </Link>

                    <button
                      onClick={() => startEdit(set)}
                      className="rounded-xl border px-4 py-2 font-bold"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => togglePublish(set)}
                      className="rounded-xl border px-4 py-2 font-bold"
                    >
                      {set.isPublished ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      onClick={() => deleteSet(set)}
                      className="rounded-xl border border-red-300 px-4 py-2 font-bold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
