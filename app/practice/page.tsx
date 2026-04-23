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
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/practice");

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error ${res.status}: ${text}`);
        }

        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error("Failed to load practice questions:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load practice questions"
        );
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

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Practice Mode</h1>
          <p className="mt-2 text-zinc-600">
            Solve practice questions and review your answers instantly.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-6 shadow">
            Loading questions...
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-white p-6 shadow">
            <div className="font-semibold text-red-600">
              Failed to load practice questions.
            </div>
            <pre className="mt-4 overflow-auto rounded-xl bg-zinc-100 p-4 text-sm">
              {error}
            </pre>
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 shadow">
            No questions found.
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, index) => (
              <div key={q.id} className="rounded-3xl bg-white p-6 shadow">
                <div className="mb-4">
                  <div className="text-sm text-zinc-500">
                    Question {index + 1}
                  </div>
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
                    Your browser does not support the audio element.
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
                      <div className="font-semibold text-green-600">
                        Correct
                      </div>
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

            <div className="sticky bottom-6 flex items-center justify-between rounded-3xl bg-white p-5 shadow-xl">
              <button
                onClick={() => setShowResult(true)}
                className="rounded-2xl bg-black px-6 py-3 font-medium text-white transition hover:bg-zinc-800"
              >
                Submit Practice
              </button>

              {showResult && (
                <div className="rounded-2xl bg-zinc-100 px-5 py-3 font-semibold">
                  Score: {calculateScore()} / {questions.length}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}