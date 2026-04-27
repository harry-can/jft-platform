"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ResultData = {
  id: string;
  totalScore: number | null;
  resultLabel: string | null;
  submittedAt: string | null;
  exam: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  answers: {
    id: string;
    selectedChoiceId: string | null;
    isCorrect: boolean | null;
    question: {
      id: string;
      text: string;
      category: string;
      options: Record<string, string> | null;
      answer: string | null;
      imageUrl?: string | null;
      audioUrl?: string | null;
      explanation?: string | null;
    };
  }[];
  categoryBreakdown: Record<string, { total: number; correct: number }>;
};

export default function ResultPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await fetch(`/api/results/${attemptId}`);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error ${res.status}: ${text}`);
        }

        const data = await res.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load result");
      }
    }

    loadResult();
  }, [attemptId]);

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-100 p-6">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-red-600">Failed to load result</h1>
          <pre className="mt-4 overflow-auto rounded-xl bg-zinc-100 p-4 text-sm">
            {error}
          </pre>
        </div>
      </div>
    );
  }

  if (!result) {
    return <div className="p-6">Loading result...</div>;
  }

  const totalQuestions = result.answers.length;
  const correct = result.answers.filter((a) => a.isCorrect).length;
  const percent = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        <div className="rounded-3xl bg-black p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold">Exam Result</h1>
          <p className="mt-2 text-zinc-300">
            {result.exam.title} • {result.user.name || result.user.email}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-sm text-zinc-300">Score</div>
              <div className="mt-2 text-3xl font-bold">
                {correct}/{totalQuestions}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-sm text-zinc-300">Percent</div>
              <div className="mt-2 text-3xl font-bold">{percent}%</div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-sm text-zinc-300">Result</div>
              <div className="mt-2 text-2xl font-bold">
                {result.resultLabel || "-"}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-sm text-zinc-300">Submitted</div>
              <div className="mt-2 text-sm font-semibold">
                {result.submittedAt
                  ? new Date(result.submittedAt).toLocaleString()
                  : "-"}
              </div>
            </div>
          </div>

        <div className="mt-6 flex flex-wrap gap-3">
  <a
    href="/student/report"
    className="rounded-xl bg-white px-4 py-2 font-semibold text-black"
  >
    View Full Report
  </a>

  <a
    href="/practice"
    className="rounded-xl border border-white/30 px-4 py-2 font-semibold text-white"
  >
    Practice Again
  </a>

  <a
    href="/exams"
    className="rounded-xl border border-white/30 px-4 py-2 font-semibold text-white"
  >
    Retest
  </a>

  <a
    href="/student/home"
    className="rounded-xl border border-white/30 px-4 py-2 font-semibold text-white"
  >
    Smart Home
  </a>
</div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Category Breakdown</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {Object.entries(result.categoryBreakdown).map(([category, stats]) => {
              const categoryPercent =
                stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

              return (
                <div key={category} className="rounded-2xl border p-4">
                  <div className="font-semibold">{category}</div>
                  <div className="mt-2 text-2xl font-bold">
                    {stats.correct}/{stats.total}
                  </div>
                  <div className="mt-3 h-3 rounded-full bg-zinc-100">
                    <div
                      className="h-3 rounded-full bg-black"
                      style={{ width: `${categoryPercent}%` }}
                    />
                  </div>
                  <div className="mt-2 text-sm text-zinc-500">
                    {categoryPercent}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Answer Review</h2>

          <div className="mt-4 space-y-5">
            {result.answers.map((a, index) => (
              <div key={a.id} className="rounded-2xl border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-zinc-500">
                      Question {index + 1} • {a.question.category}
                    </div>
                    <div className="mt-2 font-semibold">{a.question.text}</div>
                  </div>

                  <div
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      a.isCorrect
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {a.isCorrect ? "Correct" : "Wrong"}
                  </div>
                </div>

                {a.question.imageUrl && (
                  <img
                    src={a.question.imageUrl}
                    alt="Question"
                    className="mt-4 max-h-64 rounded-2xl border object-contain"
                  />
                )}

                {a.question.audioUrl && (
                  <audio controls className="mt-4 w-full">
                    <source src={a.question.audioUrl} />
                  </audio>
                )}

                {a.question.options && (
                  <div className="mt-4 grid gap-2">
                    {Object.entries(a.question.options).map(([key, value]) => (
                      <div
                        key={key}
                        className={`rounded-xl border p-3 ${
                          key === a.question.answer
                            ? "border-green-500 bg-green-50"
                            : key === a.selectedChoiceId
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                      >
                        <span className="font-medium">{key}.</span> {value}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-xl bg-zinc-100 px-3 py-2">
                    Your answer: {a.selectedChoiceId || "-"}
                  </span>
                  <span className="rounded-xl bg-zinc-100 px-3 py-2">
                    Correct answer: {a.question.answer || "-"}
                  </span>
                </div>

                {a.question.explanation && (
                  <div className="mt-4 rounded-xl bg-blue-50 p-3 text-sm text-zinc-700">
                    {a.question.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}