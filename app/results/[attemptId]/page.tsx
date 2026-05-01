"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type ResultData = {
  id: string;
  type: string;
  status: string;
  submittedAt: string | null;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  resultLabel: string | null;
  wrongRetrySetId: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  practiceSet: {
    id: string;
    title: string;
    description: string | null;
    type: string;
  };
  categoryStats: Record<
    string,
    {
      total: number;
      correct: number;
      accuracy: number;
    }
  >;
  answers: {
    id: string;
    selectedChoiceId: string | null;
    isCorrect: boolean | null;
    question: {
      id: string;
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
    };
  }[];
};

export default function ResultPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await fetch(`/api/results/${attemptId}`);

        const contentType = res.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(
            `Result API returned non-JSON response. Status: ${res.status}`
          );
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load result");
        }

        setResult(data);
      } catch (err) {
        console.error("Result load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load result");
      } finally {
        setLoading(false);
      }
    }

    if (attemptId) {
      loadResult();
    }
  }, [attemptId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 text-center shadow">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-black" />
          <p className="mt-4 font-bold">Loading result...</p>
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 shadow">
          <h1 className="text-3xl font-black">Failed to load result</h1>

          <p className="mt-3 rounded-2xl bg-red-50 p-4 font-bold text-red-700">
            {error || "Result not found"}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/student/report"
              className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
            >
              My Report
            </Link>

            <Link
              href="/practice"
              className="rounded-2xl border bg-white px-5 py-3 font-bold"
            >
              Practice
            </Link>

            <Link
              href="/student/home"
              className="rounded-2xl border bg-white px-5 py-3 font-bold"
            >
              Smart Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const correct = result.correctCount || 0;
  const totalQuestions = result.totalQuestions || result.answers.length;
  const percent = Number(result.accuracy || 0).toFixed(1);
  const isOfficialExam = result.type === "OFFICIAL_EXAM";

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-8 text-white shadow-2xl">
          <p className="font-bold text-blue-200">
            {isOfficialExam ? "Official Mock Exam Result" : "Practice Result"}
          </p>

          <h1 className="mt-2 text-4xl font-black">
            {result.practiceSet.title}
          </h1>

          <p className="mt-3 text-slate-300">
            {result.user.name || result.user.email}
            {result.submittedAt
              ? ` • Submitted ${new Date(result.submittedAt).toLocaleString()}`
              : ""}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <ResultCard title="Score" value={`${correct}/${totalQuestions}`} />
            <ResultCard title="Percent" value={`${percent}%`} />
            <ResultCard title="Result" value={result.resultLabel || "-"} />
            <ResultCard title="Type" value={result.type} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {result.type !== "OFFICIAL_EXAM" && result.wrongRetrySetId && (
              <Link
                href={`/wrong-retry/${result.wrongRetrySetId}`}
                className="rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white"
              >
                Practice Wrong Questions
              </Link>
            )}

            <Link
              href="/student/report"
              className="rounded-2xl bg-white px-5 py-3 font-bold text-black"
            >
              View Full Report
            </Link>

            <Link
              href="/practice"
              className="rounded-2xl border border-white/30 px-5 py-3 font-bold text-white"
            >
              Practice Again
            </Link>

            <Link
              href="/exams"
              className="rounded-2xl border border-white/30 px-5 py-3 font-bold text-white"
            >
              Retest
            </Link>

            <Link
              href="/student/home"
              className="rounded-2xl border border-white/30 px-5 py-3 font-bold text-white"
            >
              Smart Home
            </Link>
          </div>

          {result.type === "OFFICIAL_EXAM" && (
            <p className="mt-4 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-300">
              Official mock exams do not create wrong-question retry. Use
              category practice or full practice sets for wrong-question
              training.
            </p>
          )}
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow">
          <h2 className="text-2xl font-black">Category Analysis</h2>

          {Object.keys(result.categoryStats || {}).length === 0 ? (
            <p className="mt-4 text-slate-500">No category data found.</p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {Object.entries(result.categoryStats).map(([category, stats]) => (
                <div key={category} className="rounded-2xl border p-5">
                  <div className="font-black">{category}</div>

                  <div className="mt-2 text-3xl font-black">
                    {stats.accuracy.toFixed(1)}%
                  </div>

                  <div className="mt-2 text-sm text-slate-500">
                    {stats.correct}/{stats.total} correct
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow">
          <h2 className="text-2xl font-black">Question Review</h2>

          <div className="mt-6 space-y-5">
            {result.answers.map((answer, index) => {
              const question = answer.question;

              return (
                <div
                  key={answer.id}
                  className={`rounded-[2rem] border p-5 ${
                    answer.isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black">
                      Question {index + 1}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black">
                      {question.category}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        answer.isCorrect
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {answer.isCorrect ? "Correct" : "Wrong"}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-black leading-8">
                    {question.text}
                  </h3>

                  {question.imageUrl && (
                    <div className="mt-4 overflow-hidden rounded-2xl border bg-white">
                      <img
                        src={question.imageUrl}
                        alt="Question image"
                        className="max-h-[360px] w-full object-contain"
                      />
                    </div>
                  )}

                  {question.audioUrl && (
                    <div className="mt-4 rounded-2xl border bg-white p-4">
                      <div className="mb-2 font-bold">Audio</div>
                      <audio controls className="w-full">
                        <source src={question.audioUrl} />
                      </audio>
                    </div>
                  )}

                  {question.options && (
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {Object.entries(question.options).map(([key, value]) => {
                        const isCorrectAnswer = key === question.answer;
                        const isSelected = key === answer.selectedChoiceId;

                        return (
                          <div
                            key={key}
                            className={`rounded-2xl border bg-white p-4 ${
                              isCorrectAnswer
                                ? "border-green-500"
                                : isSelected
                                ? "border-red-500"
                                : ""
                            }`}
                          >
                            <div className="font-bold">
                              {key}. {value}
                            </div>

                            {isCorrectAnswer && (
                              <div className="mt-1 text-sm font-bold text-green-700">
                                Correct answer
                              </div>
                            )}

                            {isSelected && !isCorrectAnswer && (
                              <div className="mt-1 text-sm font-bold text-red-700">
                                Your answer
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-5 rounded-2xl bg-white p-4">
                    <div className="font-black">Explanation</div>

                    <p className="mt-2 leading-7 text-slate-600">
                      {question.explanation || "No explanation provided."}
                    </p>

                    {question.transcript && (
                      <>
                        <div className="mt-4 font-black">Transcript</div>
                        <p className="mt-2 leading-7 text-slate-600">
                          {question.transcript}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function ResultCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[2rem] bg-white/10 p-5">
      <div className="text-sm text-slate-300">{title}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}