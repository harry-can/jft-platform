
"use client";

import { useState } from "react";
import Link from "next/link";

type GeneratedQuestion = {
  id: string;
  text: string;
  category: string;
  difficulty: string;
  type: string;
  options: Record<string, string> | null;
  answer: string | null;
  explanation: string | null;
  tags: string[];
  isPublished: boolean;
};

type GeneratedPracticeSet = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  difficulty: string | null;
  isPublished: boolean;
  timeLimitMin: number | null;
  questions: GeneratedQuestion[];
};

export default function AdminImportAiPage() {
  const [prompt, setPrompt] = useState(
    "Create 20 JLPT/JFT N4 grammar MCQ questions with explanations. Use category GRAMMAR. Make it CATEGORY_PRACTICE."
  );
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [practiceSet, setPracticeSet] = useState<GeneratedPracticeSet | null>(null);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!prompt.trim() && !file) {
      alert("Please enter a prompt or upload a PDF/TXT file.");
      return;
    }

    setLoading(true);
    setError("");
    setPracticeSet(null);

    const formData = new FormData();
    formData.append("prompt", prompt);
    if (file) formData.append("file", file);

    const res = await fetch("/api/admin/import/ai", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to generate practice set");
      setLoading(false);
      return;
    }

    setPracticeSet(data.practiceSet);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow">
          <p className="font-bold text-blue-700">Admin AI Import</p>
          <h1 className="mt-2 text-4xl font-black">
            Generate Practice Set from Prompt or PDF
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Use AI to create a draft JFT/N4 practice set. Review and edit every question before publishing.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/practice-sets"
              className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
            >
              Practice Set Builder
            </Link>

            <Link
              href="/admin/question-bank"
              className="rounded-2xl border bg-white px-5 py-3 font-bold"
            >
              Question Bank
            </Link>
          </div>
        </section>

        <form onSubmit={submit} className="mt-8 rounded-[2rem] bg-white p-6 shadow">
          <h2 className="text-2xl font-black">Generate Draft Set</h2>

          <label className="mt-5 block">
            <span className="font-bold">Prompt</span>
            <textarea
              className="mt-2 min-h-44 w-full rounded-2xl border p-4 leading-7"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create 30 N4 vocabulary questions about daily life, work, station, hospital, and shopping."
            />
          </label>

          <label className="mt-5 block">
            <span className="font-bold">Upload PDF or TXT file</span>
            <input
              type="file"
              accept=".pdf,.txt"
              className="mt-2 w-full rounded-2xl border bg-white p-4"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <div className="mt-5 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
            AI-generated questions are saved as a <b>draft set</b>. You must review, edit, and publish manually.
          </div>

          {error && (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="mt-6 rounded-2xl bg-black px-6 py-3 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Draft Practice Set"}
          </button>
        </form>

        {practiceSet && (
          <section className="mt-8 rounded-[2rem] bg-white p-6 shadow">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-bold text-green-700">Draft Generated Successfully</p>
                <h2 className="mt-2 text-3xl font-black">{practiceSet.title}</h2>
                <p className="mt-2 text-slate-600">{practiceSet.description}</p>

                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <span className="rounded-xl bg-slate-100 px-3 py-2">
                    {practiceSet.type}
                  </span>
                  <span className="rounded-xl bg-slate-100 px-3 py-2">
                    {practiceSet.category || "Mixed"}
                  </span>
                  <span className="rounded-xl bg-slate-100 px-3 py-2">
                    {practiceSet.difficulty || "No difficulty"}
                  </span>
                  <span className="rounded-xl bg-slate-100 px-3 py-2">
                    {practiceSet.questions.length} questions
                  </span>
                  <span className="rounded-xl bg-yellow-100 px-3 py-2 font-bold text-yellow-700">
                    Draft
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/admin/question-bank?setId=${practiceSet.id}`}
                  className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
                >
                  Review Questions
                </Link>

                <Link
                  href="/admin/practice-sets"
                  className="rounded-2xl border bg-white px-5 py-3 font-bold"
                >
                  Open Set Builder
                </Link>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-black">Generated Questions Preview</h3>

              <div className="mt-5 space-y-4">
                {practiceSet.questions.map((q, index) => (
                  <div key={q.id} className="rounded-2xl border p-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="rounded-lg bg-slate-100 px-2 py-1">
                        #{index + 1}
                      </span>
                      <span className="rounded-lg bg-slate-100 px-2 py-1">
                        {q.category}
                      </span>
                      <span className="rounded-lg bg-slate-100 px-2 py-1">
                        {q.difficulty}
                      </span>
                      <span className="rounded-lg bg-slate-100 px-2 py-1">
                        Answer: {q.answer || "-"}
                      </span>
                    </div>

                    <h4 className="mt-3 text-lg font-black">{q.text}</h4>

                    {q.options && (
                      <div className="mt-4 grid gap-2 md:grid-cols-2">
                        {Object.entries(q.options).map(([key, value]) => (
                          <div
                            key={key}
                            className={`rounded-xl border p-3 ${
                              key === q.answer ? "border-green-500 bg-green-50" : ""
                            }`}
                          >
                            <b>{key}.</b> {value}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.explanation && (
                      <div className="mt-4 rounded-xl bg-blue-50 p-3 text-sm text-slate-700">
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
