"use client";

import { useEffect, useState } from "react";

type Question = {
  id: string;
  text: string;
  options: Record<string, string> | null;
  answer: string | null;
  category: string;
  type: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  explanation?: string | null;
};

export default function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAttemptId, setSavedAttemptId] = useState("");

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const res = await fetch("/api/practice");

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error ${res.status}: ${text}`);
        }

        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load questions");
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  const handleSelect = (questionId: string, choiceKey: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceKey,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    for (const q of questions) {
      if (answers[q.id] === q.answer) score++;
    }
    return score;
  };

  async function submitPractice() {
    setShowResult(true);
    setSaving(true);

    try {
      const res = await fetch("/api/practice/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save attempt");
        return;
      }

      setSavedAttemptId(data.attemptId);
    } catch {
      alert("Failed to save practice attempt");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Practice Mode</h1>
            <p className="mt-2 text-zinc-600">
              Practice questions are now saved to your dashboard.
            </p>
          </div>

          <a href="/dashboard" className="rounded-xl border bg-white px-4 py-2">
            Dashboard
          </a>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-6 shadow">Loading questions...</div>
        ) : error ? (
          <div className="rounded-3xl bg-white p-6 shadow text-red-600">{error}</div>
        ) : questions.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 shadow">No questions found.</div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, index) => (
              <div key={q.id} className="rounded-3xl bg-white p-6 shadow">
                <div className="mb-4">
                  <div className="text-sm text-zinc-500">Question {index + 1}</div>
                  <div className="mt-2 text-lg font-semibold">{q.text}</div>
                </div>

                {q.imageUrl && (
                  <img
                    src={q.imageUrl}
                    alt="Question"
                    className="mb-4 max-h-64 rounded-2xl border object-contain"
                  />
                )}

                {q.audioUrl && (
                  <audio controls className="mb-4 w-full">
                    <source src={q.audioUrl} />
                  </audio>
                )}

                <div className="space-y-3">
                  {q.options &&
                    Object.entries(q.options).map(([key, value]) => (
                      <label
                        key={key}
                        className={`block cursor-pointer rounded-2xl border p-4 transition ${
                          answers[q.id] === key
                            ? "border-black bg-zinc-50"
                            : "hover:bg-zinc-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={key}
                          className="mr-3"
                          checked={answers[q.id] === key}
                          onChange={() => handleSelect(q.id, key)}
                        />
                        <span className="font-medium">{key}.</span> {value}
                      </label>
                    ))}
                </div>

                {showResult && (
                  <div className="mt-4 space-y-2">
                    {answers[q.id] === q.answer ? (
                      <div className="font-semibold text-green-600">Correct</div>
                    ) : (
                      <div className="font-semibold text-red-600">
                        Wrong — Correct answer: {q.answer}
                      </div>
                    )}

                    {q.explanation && (
                      <div className="rounded-xl bg-blue-50 p-3 text-sm text-zinc-700">
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="sticky bottom-6 rounded-3xl bg-white p-5 shadow-xl">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <button
                  onClick={submitPractice}
                  disabled={saving}
                  className="rounded-2xl bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Submit & Save Practice"}
                </button>

                {showResult && (
                  <div className="rounded-2xl bg-zinc-100 px-5 py-3 font-semibold">
                    Score: {calculateScore()} / {questions.length}
                  </div>
                )}

                {savedAttemptId && (
                  <a
                    href={`/results/${savedAttemptId}`}
                    className="rounded-2xl border px-5 py-3 font-semibold"
                  >
                    View Saved Result
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}